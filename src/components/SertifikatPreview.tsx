'use client'
import { Student, Settings } from '@/lib/supabase'
import { forwardRef } from 'react'

function formatTanggal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const bulan = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ]
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  student: Student
  settings: Settings
  backgroundUrl: string
  id?: string
}

const FONT = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif"

// Helper: teks absolut di atas canvas
const pos = (
  top: number,
  left: number,
  extra?: React.CSSProperties
): React.CSSProperties => ({
  position: 'absolute',
  top: `${top}px`,
  left: `${left}px`,
  fontFamily: FONT,
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111',
  whiteSpace: 'nowrap',
  lineHeight: '1',
  ...extra,
})

// Helper: teks rata tengah
const center = (
  top: number,
  extra?: React.CSSProperties
): React.CSSProperties => ({
  position: 'absolute',
  top: `${top}px`,
  left: 0,
  width: '100%',
  textAlign: 'center',
  fontFamily: FONT,
  fontSize: '15px',
  fontWeight: 'bold',
  color: '#111',
  whiteSpace: 'nowrap',
  lineHeight: '1',
  ...extra,
})

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(
  ({ student, settings, backgroundUrl, id = 'sertifikat-canvas' }, ref) => {

    // x awal nilai (setelah label + titik dua)
    const X = 233

    // Baris identitas — jarak antar baris 41px
    const Y_NO    = 293   // No. surat — di bawah "Surat Keterangan Tamat Belajar"
    const Y_BAHWA = 369   // nilai "Menerangkan bahwa :"
    const Y_NAMA  = 410   // Nama
    const Y_NIS   = 452   // NIS
    const Y_TTL   = 493   // Tempat/Tanggal Lahir
    const Y_JK    = 534   // Jenis Kelamin

    // TTD area
    const Y_TGL   = 933
    const Y_MEN   = 959
    const Y_KEP   = 985
    const Y_NKEP  = 1068

    return (
      <div
        ref={ref}
        id={id}
        style={{
          width: '794px',
          height: '1122px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {/* Background gambar sertifikat */}
        {backgroundUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundUrl}
            alt="bg"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'fill',
            }}
            crossOrigin="anonymous"
          />
        )}

        {/* No. Surat — rata tengah, di bawah "Surat Keterangan Tamat Belajar" */}
        <div style={center(Y_NO, { fontSize: '13px', fontWeight: 'normal', letterSpacing: '0.5px' })}>
          {student.no_surat}
        </div>

        {/* Menerangkan bahwa — nilai nama */}
        <div style={pos(Y_BAHWA, X)}>
          {student.nama}
        </div>

        {/* Nama */}
        <div style={pos(Y_NAMA, X)}>
          {student.nama}
        </div>

        {/* NIS */}
        <div style={pos(Y_NIS, X)}>
          {student.nis}
        </div>

        {/* Tempat / Tanggal Lahir */}
        <div style={pos(Y_TTL, X)}>
          {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
        </div>

        {/* Jenis Kelamin */}
        <div style={pos(Y_JK, X)}>
          {student.jenis_kelamin}
        </div>

        {/* ── Area TTD ── */}

        {/* Tanggal penandatanganan */}
        <div style={center(Y_TGL, { fontWeight: 'normal', fontSize: '13px' })}>
          {settings.tanggal_ttd}
        </div>

        <div style={center(Y_MEN, { fontWeight: 'normal', fontSize: '13px' })}>
          Mengetahui
        </div>

        <div style={center(Y_KEP, { fontWeight: 'normal', fontSize: '13px' })}>
          Kepala Sekolah
        </div>

        {/* Nama Kepala Sekolah */}
        <div style={center(Y_NKEP, { textDecoration: 'underline', fontSize: '14px' })}>
          {settings.nama_kepsek}
        </div>
      </div>
    )
  }
)

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
