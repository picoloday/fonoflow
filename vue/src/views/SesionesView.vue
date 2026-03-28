<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { useSesionesStore } from '@/stores/sesiones'
import { getPagos, setPago } from '@/api/pagos'

const store     = useSesionesStore()
const mesActual = new Date().toISOString().slice(0, 7)

const mesesAbiertos = ref(new Set())
const pagosMes      = ref({})  // { 'YYYY-MM': { pacientes, total } }
const cargandoPagos = ref({})  // { 'YYYY-MM': bool }
const editando      = ref({})  // { 'YYYY-MM|pacienteId': importe_string }
const guardando     = ref({})  // { 'YYYY-MM|pacienteId': bool }

async function inicializar() {
  await store.cargar()
  mesesAbiertos.value.add(mesActual)
  mesesAbiertos.value = new Set(mesesAbiertos.value)
  // Siempre recargar el mes actual (puede haber cambiado desde el perfil del paciente)
  delete pagosMes.value[mesActual]
  await cargarPagos(mesActual)
}

onMounted(inicializar)
onActivated(inicializar)  // por si el componente está en keep-alive

async function cargarPagos(mes) {
  if (cargandoPagos.value[mes]) return
  cargandoPagos.value[mes] = true
  try {
    const { data } = await getPagos(mes)
    pagosMes.value[mes] = data.data
  } finally {
    cargandoPagos.value[mes] = false
  }
}

async function toggleMes(mes) {
  if (mesesAbiertos.value.has(mes)) {
    mesesAbiertos.value.delete(mes)
  } else {
    mesesAbiertos.value.add(mes)
    await cargarPagos(mes)
  }
  mesesAbiertos.value = new Set(mesesAbiertos.value)
}

function iniciarEdicion(mes, pacienteId, importeActual) {
  const key = `${mes}|${pacienteId}`
  editando.value[key] = importeActual !== null ? String(importeActual) : ''
}

function parsearImporte(valor) {
  // Acepta tanto "39,00" (móvil español) como "39.00"
  const normalizado = String(valor ?? '').trim().replace(',', '.')
  const num = parseFloat(normalizado)
  return isNaN(num) ? 0 : num
}

async function guardarPago(mes, pacienteId) {
  const key     = `${mes}|${pacienteId}`
  const importe = parsearImporte(editando.value[key])
  delete editando.value[key]

  guardando.value[key] = true
  try {
    await setPago(pacienteId, mes, importe)

    // Actualizar estado local
    const detalle = pagosMes.value[mes]
    if (detalle) {
      const p = detalle.pacientes.find(p => p.paciente_id == pacienteId)
      if (p) p.importe = importe
      detalle.total = detalle.pacientes.reduce((s, p) => s + (p.importe ?? 0), 0)
    }
    // Sincronizar resumen global
    const rm = store.resumen.meses.find(m => m.mes === mes)
    if (rm) rm.ingresos = pagosMes.value[mes]?.total ?? 0
    store.resumen.total_ingresos = store.resumen.meses.reduce((s, m) => s + Number(m.ingresos ?? 0), 0)
  } finally {
    delete guardando.value[key]
  }
}

function cancelarEdicion(mes, pacienteId) {
  delete editando.value[`${mes}|${pacienteId}`]
}

const nombreMes = (ym) => {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

    <div>
      <h1 class="text-2xl font-bold text-gray-900">Facturación</h1>
      <p class="text-sm text-gray-500 mt-0.5">
        {{ store.resumen.total_sesiones }} sesiones ·
        <span class="font-medium text-teal-700">{{ Number(store.resumen.total_ingresos).toFixed(2) }} € cobrado</span>
      </p>
    </div>

    <!-- Skeleton -->
    <div v-if="store.loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse flex justify-between">
        <div class="h-4 bg-gray-200 rounded w-32"></div>
        <div class="h-4 bg-gray-100 rounded w-20"></div>
      </div>
    </div>

    <!-- Lista de meses -->
    <div v-else class="space-y-2">
      <div v-for="m in store.resumen.meses" :key="m.mes"
        class="bg-white shadow-sm rounded-xl overflow-hidden">

        <!-- Cabecera mes -->
        <button @click="toggleMes(m.mes)"
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-gray-400 transition-transform"
              :class="mesesAbiertos.has(m.mes) ? 'rotate-90' : ''"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="font-semibold text-gray-700 capitalize">{{ nombreMes(m.mes) }}</span>
            <span class="text-xs text-gray-400">{{ m.total }} sesiones</span>
          </div>
          <span class="text-sm font-semibold" :class="m.ingresos > 0 ? 'text-teal-600' : 'text-gray-400'">
            {{ Number(m.ingresos).toFixed(2) }} €
          </span>
        </button>

        <!-- Contenido del mes: pacientes con su pago -->
        <div v-if="mesesAbiertos.has(m.mes)" class="border-t border-gray-100">

          <!-- Cargando -->
          <div v-if="cargandoPagos[m.mes]" class="p-4 space-y-2">
            <div v-for="i in 3" :key="i" class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>

          <div v-else-if="pagosMes[m.mes]">
            <!-- Cabecera tabla -->
            <div class="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <span class="col-span-6">Paciente</span>
              <span class="col-span-2 text-center">Sesiones</span>
              <span class="col-span-4 text-right">Pagado este mes</span>
            </div>

            <!-- Fila por paciente -->
            <div v-for="p in pagosMes[m.mes].pacientes" :key="p.paciente_id"
              class="grid grid-cols-12 gap-2 items-center px-5 py-3 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">

              <span class="col-span-6 text-sm font-medium text-gray-800">{{ p.nombre }}</span>
              <span class="col-span-2 text-center text-sm text-gray-500">{{ p.sesiones }}</span>

              <!-- Importe: editable inline -->
              <div class="col-span-4 flex items-center justify-end gap-2">
                <template v-if="editando[`${m.mes}|${p.paciente_id}`] !== undefined">
                  <input
                    :value="editando[`${m.mes}|${p.paciente_id}`]"
                    @input="editando[`${m.mes}|${p.paciente_id}`] = $event.target.value"
                    type="text" inputmode="decimal"
                    placeholder="0"
                    class="w-20 text-right border border-teal-400 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    @keyup.enter="guardarPago(m.mes, p.paciente_id)"
                    @keyup.escape="cancelarEdicion(m.mes, p.paciente_id)"
                    :ref="el => el && el.focus()"
                  />
                  <button @click="guardarPago(m.mes, p.paciente_id)"
                    class="flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white hover:bg-teal-700 shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                </template>
                <template v-else>
                  <!-- Confirmado = registro histórico bloqueado visualmente -->
                  <span v-if="p.confirmado"
                    class="text-sm font-medium text-teal-700 px-2 py-1 cursor-default"
                    title="Pago confirmado y registrado">
                    {{ Number(p.importe).toFixed(2) }} €
                    <span class="ml-1 text-xs text-teal-400">✓</span>
                  </span>
                  <!-- No confirmado = sugerido desde valor_mensual, editable -->
                  <span v-else
                    @click="iniciarEdicion(m.mes, p.paciente_id, p.importe)"
                    class="text-sm cursor-pointer select-none px-2 py-1 rounded-lg transition-colors border border-dashed"
                    :class="p.importe !== null
                      ? 'text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-700'
                      : 'text-gray-400 border-gray-200 italic hover:border-teal-300'"
                    title="Sin confirmar — haz clic para registrar el pago"
                  >
                    {{ p.importe !== null ? Number(p.importe).toFixed(2) + ' €' : 'Sin valor' }}
                  </span>
                  <button @click="iniciarEdicion(m.mes, p.paciente_id, p.importe)"
                    class="text-gray-300 hover:text-teal-600 transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- Total del mes -->
            <div class="grid grid-cols-12 gap-2 items-center px-5 py-3 bg-teal-50 border-t border-teal-100">
              <span class="col-span-8 text-sm font-semibold text-teal-800">Total cobrado</span>
              <span class="col-span-4 text-right text-sm font-bold text-teal-700">
                {{ Number(pagosMes[m.mes].total).toFixed(2) }} €
              </span>
            </div>
          </div>

        </div>
      </div>

      <div v-if="!store.resumen.meses.length" class="text-center py-12 text-gray-400">
        No hay sesiones registradas
      </div>
    </div>

  </div>
</template>
