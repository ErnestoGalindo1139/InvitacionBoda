import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Users,
  Megaphone,
  CheckCircle,
} from 'lucide-react';
import LogoSimposio from '/img/1ER_SIMPOSIO_LOGO_PRINCIPAL_01.png';

export const EventoEnero: React.FC = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    correo: '',
    empresa: '',
    mensaje: '',
  });

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [folioGenerado, setFolioGenerado] = useState('');

  const generarFolio = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const ts = String(Date.now()).slice(-4);
    return `PLD-2026-${random}-${ts}`;
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviarWhatsApp = (folio: string) => {
    const phone = '526692291634';

    const mensaje =
      `Hola, quiero registrarme al Simposio PLD.%0A%0A` +
      `*Nombre:* ${form.nombre} ${form.apellidoPaterno} ${form.apellidoMaterno}%0A` +
      `*Teléfono:* ${form.telefono}%0A` +
      `*Correo:* ${form.correo}%0A` +
      `*Empresa:* ${form.empresa || 'No especificada'}%0A` +
      `*Mensaje:* ${form.mensaje || 'Sin mensaje adicional'}%0A` +
      `*Folio:* ${folio}%0A%0A` +
      `---%0AEnviado desde el sitio oficial RCCO Abogados`;

    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phone}&text=${mensaje}`;
    } else {
      window.open(
        `https://api.whatsapp.com/send?phone=${phone}&text=${mensaje}`,
        '_blank'
      );
    }
  };

  const crearRegistro = async () => {
    if (
      !form.nombre ||
      !form.apellidoPaterno ||
      !form.correo ||
      !form.telefono
    ) {
      setModalOpen(true);
      setFolioGenerado('ERROR_FALTAN_CAMPOS');
      return;
    }

    setLoading(true);

    try {
      const folio = generarFolio();

      const res = await fetch(
        'https://api-rcco-abogados.grstechs.com/createUsuariosEvento',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nb_Nombre: form.nombre,
            nb_ApellidoPaterno: form.apellidoPaterno,
            nb_ApellidoMaterno: form.apellidoMaterno,
            de_Celular: form.telefono,
            de_Correo: form.correo,
            nb_Empresa: form.empresa,
            de_Comentarios: form.mensaje,
            fh_Pago: null,
            nu_Folio: folio,
            sn_Pagado: false,
            sn_Activo: true,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setForm({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        telefono: '',
        correo: '',
        empresa: '',
        mensaje: '',
      });

      setFolioGenerado(folio);
      setModalOpen(true);
      enviarWhatsApp(folio);
    } catch (err: unknown) {
      console.error(err);
      setFolioGenerado('ERROR_GENERAL');
      setModalOpen(true);
    }

    setLoading(false);
  };

  const inputClass = `
    w-full px-4 py-3 
    bg-white 
    border border-gray-300 
    rounded-xl
    text-[#031a43]
    placeholder-gray-500
    shadow-sm
    hover:border-[#062b63]
    focus:ring-2 focus:ring-[#0a387c]
    focus:border-[#0a387c]
    transition-all duration-200
  `;

  return (
    <section
      id="evento-enero"
      className="relative w-full py-[7rem] px-6 overflow-hidden bg-gradient-to-b from-[#0A1A3B] to-[#07152E]"
    >
      {/* FONDO */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#031a43] via-[#062b63] to-[#0a387c]" />

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

            {folioGenerado === 'ERROR_FALTAN_CAMPOS' ? (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Faltan datos
                </h2>
                <p className="text-gray-700">
                  Completa todos los campos obligatorios.
                </p>
              </>
            ) : folioGenerado === 'ERROR_GENERAL' ? (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Error en el registro
                </h2>
                <p className="text-gray-700">Inténtalo más tarde.</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-green-700 mb-2">
                  Registro exitoso 🎉
                </h2>
                <p className="text-gray-700 mb-2">Tu folio es:</p>
                <p className="text-lg font-extrabold text-[#0a387c]">
                  {folioGenerado}
                </p>
                <p className="text-gray-500 mt-3 text-sm">
                  También te hemos enviado a WhatsApp para confirmar el
                  registro.
                </p>
              </>
            )}

            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full py-3 bg-[#0a387c] hover:bg-[#0f4ca8] text-white rounded-xl font-semibold"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="max-w-[82%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[5rem] items-center">
        {/* COLUMNA IZQUIERDA */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="text-white"
        >
          {/* ⭐ LOGO CON FONDO CLARO ⭐ */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="
              mb-10 p-5 rounded-2xl
              bg-white/95
              border border-[#d4af37]/60
              shadow-[0_8px_20px_rgba(0,0,0,0.25)]
              w-fit
            "
          >
            <img
              src={LogoSimposio}
              alt="Logo Simposio PLD"
              className="w-[280px] md:w-[360px]"
              style={{
                filter: 'brightness(1.1) contrast(1.1)',
              }}
            />
          </motion.div>

          {/* TITULO */}
          <h2 className="text-lg md:text-2xl font-semibold text-white/80 mb-8">
            Reformas Estructurales a la Ley Antilavado (LFPIORPI 2025)
          </h2>

          <p className="text-white/80 text-base leading-relaxed mb-10 max-w-[570px]">
            Un foro especializado dirigido a empresarios, abogados, notarios,
            contadores y profesionales de actividades vulnerables.
          </p>

          <div className="space-y-5 text-white/90">
            <div className="flex items-center gap-4">
              <CalendarDays className="w-6 h-6 text-blue-200" />
              <span className="text-base md:text-lg">
                23 y 24 de Enero de 2025
              </span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-blue-200" />
              <span className="text-base md:text-lg">
                Salón Fiesta Inn · Isla Tres · Mazatlán
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-blue-200" />
              <span className="text-base md:text-lg">
                Cupo limitado · Registro obligatorio
              </span>
            </div>
          </div>
        </motion.div>

        {/* FORMULARIO */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
        >
          <h3 className="text-xl md:text-2xl font-bold text-[#04163B] text-center mb-6">
            Registro al Simposio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="nombre"
              placeholder="Nombre"
              onChange={onChange}
              value={form.nombre}
              className={inputClass}
            />
            <input
              name="apellidoPaterno"
              placeholder="Apellido paterno"
              onChange={onChange}
              value={form.apellidoPaterno}
              className={inputClass}
            />
            <input
              name="apellidoMaterno"
              placeholder="Apellido materno"
              onChange={onChange}
              value={form.apellidoMaterno}
              className={inputClass}
            />
            <input
              name="telefono"
              placeholder="Teléfono"
              onChange={onChange}
              value={form.telefono}
              className={inputClass}
            />
            <input
              name="correo"
              placeholder="Correo electrónico"
              onChange={onChange}
              value={form.correo}
              className={inputClass}
            />
            <input
              name="empresa"
              placeholder="Empresa (opcional)"
              onChange={onChange}
              value={form.empresa}
              className={inputClass}
            />
          </div>

          <textarea
            name="mensaje"
            rows={4}
            placeholder="Mensaje opcional..."
            onChange={onChange}
            value={form.mensaje}
            className={`${inputClass} mt-4`}
          />

          <button
            disabled={loading}
            onClick={crearRegistro}
            className="
              w-full mt-6 py-3 rounded-xl
              bg-[#0a387c] hover:bg-[#114b9c]
              text-white text-lg font-semibold
              shadow-lg hover:shadow-blue-600/40
              transition-all
            "
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
