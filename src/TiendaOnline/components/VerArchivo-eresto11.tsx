import React, { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { ModalBase } from './ModalBase';

interface VerArchivoProps {
  url: string;
  tipo?: string;
  nombre?: string;
  isOpen?: boolean;
  onClose?: () => void;
  modo?: 'inline' | 'modal';
}

export const VerArchivo: React.FC<VerArchivoProps> = ({
  url,
  tipo,
  nombre,
  isOpen = false,
  onClose,
  modo = 'inline',
}) => {
  const [xmlContent, setXmlContent] = useState<string | null>(null);

  const extension = nombre?.split('.').pop()?.toLowerCase();
  const isPDF = tipo?.includes('pdf') || extension === 'pdf';
  const isImage =
    tipo?.includes('image') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  const isXML = tipo?.includes('xml') || extension === 'xml';

  // Detectar móvil
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  );

  // 📌 Si es PDF y es móvil → abrir directamente y no mostrar modal
  useEffect(() => {
    if (isOpen && isPDF && isMobile) {
      window.open(url, '_blank');

      // Cerrar modal si existe callback
      if (onClose) onClose();
    }
  }, [isOpen, isPDF, isMobile, url, onClose]);

  // Render vacío si es móvil y PDF (evita mostrar modal vacío)
  if (isPDF && isMobile) {
    return null;
  }

  // =================== XML ===================
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isXML && url) {
      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          const formatted = new XMLSerializer().serializeToString(
            new DOMParser().parseFromString(text, 'application/xml')
          );
          setXmlContent(formatted);
        })
        .catch(() => setXmlContent('⚠️ No se pudo cargar el XML.'));
    }
  }, [url, isXML]);

  // =================== CONTENIDO DESKTOP ===================

  let content: React.ReactNode;

  if (isImage) {
    content = (
      <img
        src={url}
        alt={nombre || 'Archivo'}
        className="max-h-[70vh] rounded-lg shadow-md mx-auto"
      />
    );
  } else if (isPDF) {
    // Desktop → sí mostrar iframe
    content = (
      <iframe
        src={url}
        className="w-full h-[70vh] rounded-lg border border-[var(--color-border)]"
      />
    );
  } else if (isXML) {
    content = (
      <pre
        className="bg-[var(--color-bg)] text-[var(--color-text)] text-sm p-3 rounded-lg
                   border border-[var(--color-border)] overflow-auto max-h-[70vh] whitespace-pre-wrap"
      >
        {xmlContent || 'Cargando XML...'}
      </pre>
    );
  } else {
    content = (
      <div className="flex flex-col items-center justify-center p-6 text-[var(--color-muted)]">
        <FileText size={40} />
        <p className="mt-2 text-sm">Vista previa no disponible</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-[var(--color-primary)] underline text-sm"
        >
          <Download size={14} /> Descargar archivo
        </a>
      </div>
    );
  }

  if (modo === 'modal') {
    return (
      <ModalBase
        isOpen={isOpen}
        onClose={onClose || ((): void => {})}
        title={''}
        maxWidth="3xl"
      >
        {content}
      </ModalBase>
    );
  }

  return <>{content}</>;
};
