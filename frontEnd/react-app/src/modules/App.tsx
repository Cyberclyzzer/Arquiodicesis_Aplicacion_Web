import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { MultiStepForm } from './form/MultiStepForm'

export function App() {
  const [step, setStep] = useState(0)

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[azure] via-[beige] to-[rgba(241,212,167,0.9)]" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
      <header className="w-full mb-6 p-3 sm:p-5 md:p-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Formulario de documentos</h1>
        <p className="text-sm text-gray-700">Arquidiócesis</p>
        <nav>
          <a href="/views/tablaDocumentos.html">Ver documentos</a>
          <a href="/views/paginaPrincipal.html">Página Principal</a>
        </nav>
      </header>
      <div className="w-full mx-auto px-3 sm:px-6 md:px-10 pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <MultiStepForm onDone={() => setStep(step + 1)} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
