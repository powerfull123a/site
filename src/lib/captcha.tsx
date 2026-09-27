import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────
   Простая капча для защиты форм от ботов.
   В проде заменяется на reCAPTCHA / hCaptcha (см. .env.example).
   ───────────────────────────────────────────── */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeCode(len = 5) {
  let out = ''
  for (let i = 0; i < len; i++) out += CHARS[Math.floor(Math.random() * CHARS.length)]
  return out
}

export function Captcha({
  value,
  onChange,
  onVerify,
}: {
  value: string
  onChange: (v: string) => void
  onVerify?: (ok: boolean) => void
}) {
  const [code, setCode] = useState(makeCode)
  const [shake, setShake] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback((text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = (canvas.width = 200)
    const h = (canvas.height = 64)

    ctx.fillStyle = '#0f0f13'
    ctx.fillRect(0, 0, w, h)

    // сетка
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    // шумовые линии
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(244,63,79,${0.1 + Math.random() * 0.2})`
      ctx.beginPath()
      ctx.moveTo(Math.random() * w, Math.random() * h)
      ctx.bezierCurveTo(
        Math.random() * w, Math.random() * h,
        Math.random() * w, Math.random() * h,
        Math.random() * w, Math.random() * h,
      )
      ctx.stroke()
    }

    // символы
    const step = w / (text.length + 1)
    for (let i = 0; i < text.length; i++) {
      ctx.save()
      ctx.translate(step * (i + 0.5), h / 2 + (Math.random() * 8 - 4))
      ctx.rotate((Math.random() - 0.5) * 0.5)
      ctx.font = `bold ${26 + Math.random() * 8}px ui-monospace, monospace`
      ctx.fillStyle = `hsl(${350 + Math.random() * 20}, ${70 + Math.random() * 25}%, ${58 + Math.random() * 22}%)`
      ctx.shadowColor = 'rgba(244,63,79,0.55)'
      ctx.shadowBlur = 8
      ctx.fillText(text[i], -14, 8)
      ctx.restore()
    }

    // точки-шум
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
    }
  }, [])

  const regenerate = useCallback(() => {
    const next = makeCode()
    setCode(next)
    setShake((s) => s + 1)
    onChange('')
    draw(next)
  }, [draw, onChange])

  useEffect(() => {
    draw(code)
  }, [code, draw])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <motion.div
          key={code}
          animate={shake ? { x: [0, -7, 7, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative shrink-0 overflow-hidden rounded-lg border border-white/10"
        >
          <canvas ref={canvasRef} className="block h-16 w-[200px]" aria-label="Капча" />
        </motion.div>
        <button
          type="button"
          onClick={regenerate}
          className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white/55 transition-colors hover:border-brand-500/40 hover:text-brand-300"
          aria-label="Обновить капчу"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 5))}
        placeholder="Введите код с картинки"
        className={cn('field py-2.5 font-mono text-sm tracking-[0.35em]')}
        autoComplete="off"
        spellCheck={false}
        aria-label="Введите код капчи"
      />

      <AnimatePresence>
        {value.length === 5 && value !== code && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-white/35">
            Подсказка для демо: код <span className="font-mono text-brand-300">{code}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Скрытая проверка для вызывающего кода */}
      <CaptchaBridge code={code} value={value} onVerify={onVerify} />
    </div>
  )
}

function CaptchaBridge({
  code,
  value,
  onVerify,
}: {
  code: string
  value: string
  onVerify?: (ok: boolean) => void
}) {
  useEffect(() => {
    if (value.length === 5) onVerify?.(value === code)
  }, [value, code, onVerify])
  return null
}

/** Валидатор email и пароля — используется в формах авторизации. */
export const validators = {
  email: (v: string) => {
    if (!v.trim()) return 'Введите email'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Некорректный email'
    return ''
  },
  password: (v: string) => {
    if (!v) return 'Введите пароль'
    if (v.length < 8) return 'Минимум 8 символов'
    if (!/[A-Za-zА-Яа-я]/.test(v)) return 'Добавьте буквы'
    if (!/\d/.test(v)) return 'Добавьте цифры'
    return ''
  },
  name: (v: string) => {
    if (!v.trim()) return 'Введите имя'
    if (v.trim().length < 2) return 'Слишком короткое имя'
    return ''
  },
}
