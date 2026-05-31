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

const SertifikatPreview = forwardRef<HTMLDivElement, Props>(
  ({ student, settings, backgroundUrl, id = 'sertifikat-canvas' }, ref) => {

    // Teks rata tengah
    const center = (top: number, extra?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      top: `${top}px`,
      left: 0,
      width: '100%',
      textAlign: 'center',
      fontFamily: FONT,
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#111',
      whiteSpace: 'nowrap',
      lineHeight: '1',
      ...extra,
    })

    // Teks dengan posisi kiri (X) tertentu
    const pos = (top: number, left: number, extra?: React.CSSProperties): React.CSSProperties => ({
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      fontFamily: FONT,
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#111',
      whiteSpace: 'nowrap',
      lineHeight: '1',
      ...extra,
    })

    // ── Koordinat dari Photoshop (dikonversi ke canvas 794×1122) ──
    // No. surat → tepat di bawah "Surat Keterangan Tamat Belajar"
    const Y_NO    = 407
    // Nilai "Menerangkan bahwa :" → X=311, Y=478
    const X_VALUE = 311
    const Y_BAHWA = 478
    // Nama, NIS, TTL, JK
    const Y_NAMA  = 495
    const Y_NIS   = 538
    const Y_TTL   = 561
    const Y_JK    = 621

    // Area TTD (tidak berubah)
    const Y_TGL  = 933
    const Y_MEN  = 959
    const Y_KEP  = 985
    const Y_NKEP = 1068

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
        {/* Background */}
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

        {/* No. Surat — rata tengah di bawah judul */}
        <div style={center(Y_NO, { fontSize: '13px', fontWeight: 'normal', letterSpacing: '0.5px' })}>
          {student.no_surat}
        </div>

        {/* Nilai "Menerangkan bahwa :" */}
        <div style={pos(Y_BAHWA, X_VALUE)}>
          {student.nama}
        </div>

        {/* Nama */}
        <div style={pos(Y_NAMA, X_VALUE)}>
          {student.nama}
        </div>

        {/* NIS */}
        <div style={pos(Y_NIS, X_VALUE)}>
          {student.nis}
        </div>

        {/* Tempat / Tanggal Lahir */}
        <div style={pos(Y_TTL, X_VALUE)}>
          {student.tempat_lahir}, {formatTanggal(student.tanggal_lahir)}
        </div>

        {/* Jenis Kelamin */}
        <div style={pos(Y_JK, X_VALUE)}>
          {student.jenis_kelamin}
        </div>

        {/* ── Area TTD ── */}
        <div style={center(Y_TGL, { fontWeight: 'normal', fontSize: '13px' })}>
          {settings.tanggal_ttd}
        </div>
        <div style={center(Y_MEN, { fontWeight: 'normal', fontSize: '13px' })}>
          Mengetahui
        </div>
        <div style={center(Y_KEP, { fontWeight: 'normal', fontSize: '13px' })}>
          Kepala Sekolah
        </div>
        <div style={center(Y_NKEP, { textDecoration: 'underline', fontSize: '14px' })}>
          {settings.nama_kepsek}
        </div>
      </div>
    )
  }
)

SertifikatPreview.displayName = 'SertifikatPreview'
export default SertifikatPreview
