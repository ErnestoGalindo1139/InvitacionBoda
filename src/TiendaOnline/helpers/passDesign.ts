import type { Pass } from './api';
import { invitacion } from '../data/invitacion';

export function passDetails(pass: Pass): {
  date: string;
  venue: string;
  time: string;
  reference: string;
  quantity: string;
} {
  const date = new Date(pass.fh_Boda);
  const valid = Number.isFinite(date.getTime());
  return {
    date: valid
      ? new Intl.DateTimeFormat('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'America/Mazatlan',
        }).format(date)
      : 'Fecha por confirmar',
    venue: invitacion.recepcion.nombre,
    time: invitacion.recepcion.hora,
    reference: pass.nb_TokenQR.slice(-8).toUpperCase(),
    quantity: `${pass.nu_PasesConfirmados} pase${pass.nu_PasesConfirmados === 1 ? '' : 's'}`,
  };
}

// Local artwork at print resolution, with the same colors and sections as the web ticket.
export async function passPng(pass: Pass, qr: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx)
    throw new Error(
      'Tu navegador no permite descargar el pase. Usa la opción imprimir.'
    );
  const details = passDetails(pass);
  const colors = {
    green: '#27413e',
    gold: '#b99a69',
    cream: '#fffaf0',
    muted: '#796e5c',
  };
  const wrap = (value: string, font: string, maxWidth: number): string[] => {
    ctx.font = font;
    const lines: string[] = [];
    let line = '';
    for (const word of value.trim().split(/\s+/)) {
      if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
        lines.push(line);
        line = '';
      }
      for (const character of `${line ? ' ' : ''}${word}`) {
        if (ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    if (line) lines.push(line);
    return lines;
  };
  const titleLines = wrap(pass.nb_Boda, '72px Georgia', 840);
  const guestLines = wrap(pass.nb_Persona, '58px Georgia', 840);
  const venueLines = wrap(details.venue, '34px Georgia', 850);
  const headerBottom = 274 + titleLines.length * 86;
  const divider =
    headerBottom + 260 + guestLines.length * 70 + venueLines.length * 42;
  canvas.width = 1080;
  canvas.height = divider + 660;
  const text = (
    value: string,
    x: number,
    y: number,
    font: string,
    color = colors.green
  ): void => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(value, x, y);
  };
  ctx.fillStyle = '#f7f3ec';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(40, 40, 1000, canvas.height - 80, 24);
  ctx.clip();
  ctx.fillStyle = colors.cream;
  ctx.fillRect(40, 40, 1000, canvas.height - 80);
  ctx.fillStyle = colors.green;
  ctx.fillRect(40, 40, 1000, headerBottom - 40);
  ctx.fillStyle = colors.gold;
  for (let x = 64; x < 1020; x += 42) {
    ctx.fillRect(x, 58, 20, 9);
    ctx.fillRect(x, headerBottom - 26, 20, 9);
  }
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 1;
  ctx.strokeRect(68, 88, 944, headerBottom - 134);
  text('UNA PELÍCULA DE AMOR', 540, 137, '24px Arial', colors.gold);
  titleLines.forEach((line, index) =>
    text(line, 540, 232 + index * 86, '72px Georgia', colors.cream)
  );
  text(
    'Nuestro gran estreno',
    540,
    headerBottom - 73,
    'italic 34px Georgia',
    colors.gold
  );
  let y = headerBottom + 65;
  text('INVITACIÓN PARA', 540, y, '23px Arial', colors.muted);
  guestLines.forEach((line) => {
    y += 70;
    text(line, 540, y, '58px Georgia');
  });
  y += 54;
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  ctx.moveTo(435, y);
  ctx.lineTo(645, y);
  ctx.stroke();
  y += 54;
  text(details.date, 540, y, '34px Georgia');
  venueLines.forEach((line) => {
    y += 44;
    text(line, 540, y, '34px Georgia');
  });
  text(`RECEPCIÓN · ${details.time}`, 540, y + 47, '24px Arial', colors.muted);
  ctx.setLineDash([10, 12]);
  ctx.strokeStyle = colors.gold;
  ctx.beginPath();
  ctx.moveTo(40, divider);
  ctx.lineTo(1040, divider);
  ctx.stroke();
  ctx.setLineDash([]);
  const qrImage = new Image();
  qrImage.src = qr;
  await qrImage.decode();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(580, divider + 56, 370, 370, 16);
  ctx.fill();
  ctx.strokeStyle = '#dfd4be';
  ctx.stroke();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrImage, 595, divider + 71, 340, 340);
  text('ACCESO CONFIRMADO', 305, divider + 102, '23px Arial', colors.muted);
  text(String(pass.nu_PasesConfirmados), 305, divider + 270, '160px Georgia');
  text(
    pass.nu_PasesConfirmados === 1 ? 'pase' : 'pases',
    305,
    divider + 318,
    '34px Georgia'
  );
  text('PARA CELEBRAR CONTIGO', 305, divider + 371, '19px Arial', colors.muted);
  text(
    `FOLIO ${details.reference}`,
    765,
    divider + 463,
    '23px Arial',
    colors.muted
  );
  ctx.strokeStyle = '#dfd4be';
  ctx.beginPath();
  ctx.moveTo(100, divider + 496);
  ctx.lineTo(980, divider + 496);
  ctx.stroke();
  text('Una noche para recordar', 540, divider + 542, 'italic 30px Georgia');
  text(
    'Presenta este pase al llegar a la celebración.',
    540,
    divider + 578,
    '23px Arial',
    colors.muted
  );
  ctx.restore();
  ctx.strokeStyle = colors.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 40, 1000, canvas.height - 80, 24);
  ctx.stroke();
  for (const x of [40, 1040]) {
    ctx.fillStyle = '#f7f3ec';
    ctx.beginPath();
    ctx.arc(x, divider, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.gold;
    ctx.beginPath();
    ctx.arc(
      x,
      divider,
      24,
      x === 40 ? -Math.PI / 2 : Math.PI / 2,
      x === 40 ? Math.PI / 2 : (3 * Math.PI) / 2
    );
    ctx.stroke();
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  );
  if (!blob) throw new Error('No se pudo descargar. Intenta imprimir el pase.');
  return blob;
}
