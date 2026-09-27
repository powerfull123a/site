import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { GridBackdrop, Reveal } from '@/components/fx'
import { Captcha, validators } from '@/lib/captcha'
import { useAuth } from '@/store/auth'
import { useToast } from '@/store/toast'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/* ─────────────────────────────────────────────
   Общая обёртка для страниц авторизации
   ───────────────────────────────────────────── */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden py-12 sm:py-16">
      <GridBackdrop />

      <div className="shell relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        {/* Форма */}
        <Reveal dir="right" className="mx-auto w-full max-w-md">
          <div className="card p-6 sm:p-8">
            <h1 className="h-display text-2xl sm:text-3xl">{title}</h1>
            <p className="mt-2.5 text-sm text-white/45">{subtitle}</p>
            <div className="my-6 hairline" />
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-white/45">{footer}</p>
        </Reveal>

        {/* Преимущества */}
        <Reveal dir="left" delay={0.12} className="hidden lg:block">
          <div>
            <h2 className="h-display max-w-md text-4xl">
              Один аккаунт для <span className="grad-text">всего</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/50">
              Jarwis объединяет ИИ-ассистента и безопасный маркетплейс. Купили подписку — получили доступ к
              защищённым сделкам и внутреннему чату с продавцами.
            </p>

            <ul className="mt-9 space-y-4">
              {[
                { icon: ShieldCheck, title: 'Сделки под защитой', text: 'Эскроу удерживает деньги до подтверждения' },
                { icon: Lock, title: 'Данные в безопасности', text: 'Двухфакторная аутентификация на всех устройствах' },
                { icon: Check, title: 'Единый баланс', text: 'Пополняйте один раз и платите за всё сразу' },
              ].map((f) => (
                <motion.li
                  key={f.title}
                  whileHover={{ x: 6 }}
                  className="group flex items-start gap-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/12 text-brand-400 ring-1 ring-brand-500/20 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <f.icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">{f.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-white/45">{f.text}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Кнопка Google
   ───────────────────────────────────────────── */
export function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="btn-ghost w-full"
    >
      <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
        <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12c-.2 2-1.5 5-4.4 7l6.7 5.2c3.9-3.6 6.2-8.9 6.2-15.9z" />
        <path fill="#34A853" d="M24 46c5.9 0 10.9-1.9 14.5-5.3l-6.7-5.2c-1.8 1.3-4.2 2.2-7.8 2.2-5.9 0-10.9-3.9-12.7-9.3l-7.1 5.5C8 41.4 15.4 46 24 46z" />
        <path fill="#FBBC05" d="M11.3 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4l-7.1-5.5C2.6 17.1 1.6 20.9 1.6 24s1 6.9 2.6 9.9l7.1-5.5z" />
        <path fill="#EA4335" d="M24 10.8c3.3 0 5.5 1.4 6.7 2.5l4.9-4.8C32.4 5.6 28.4 3.5 24 3.5 15.4 3.5 8 8.1 4.2 14.1l7.1 5.5C13.1 14.2 18.1 10.8 24 10.8z" />
      </svg>
      Продолжить с Google
    </button>
  )
}

/* ─────────────────────────────────────────────
   Поля пароля с показом
   ───────────────────────────────────────────── */
export function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      icon={<Lock size={15} />}
      addon={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-white/35 transition-colors hover:text-white"
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  )
}

/* ─────────────────────────────────────────────
   Индикатор надёжности пароля
   ───────────────────────────────────────────── */
export function PasswordStrength({ value }: { value: string }) {
  const score = [value.length >= 8, /[A-ZА-Я]/.test(value), /\d/.test(value), /[^\w\s]/.test(value)].filter(Boolean).length
  const labels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный']
  const tones = ['bg-brand-600', 'bg-brand-500', 'bg-gold-500', 'bg-sky-500', 'bg-emerald-500']

  if (!value) return null

  return (
    <div className="mt-2.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors duration-500', i < score ? tones[score] : 'bg-white/10')}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-white/40">
        Надёжность: <span className="font-semibold text-white/70">{labels[score]}</span>
      </p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Страница входа
   ───────────────────────────────────────────── */
export function Login() {
  const { signIn, signInWithGoogle, signOut, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const redirect = params.get('next') ?? '/cabinet/buyer'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      email: validators.email(email),
      password: password ? '' : 'Введите пароль',
    }
    setErrors(errs)
    if (errs.email || errs.password) return

    setLoading(true)
    try {
      const account = await signIn(email, password)
      toast.success(`С возвращением, ${account.name.split(' ')[0]}!`, 'Вы вошли в аккаунт Jarwis.')
      navigate(redirect, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    setGoogleLoading(true)
    try {
      const account = await signInWithGoogle()
      toast.success('Вход через Google', `Добро пожаловать, ${account.name}!`)
      navigate(redirect, { replace: true })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Вход в аккаунт"
      subtitle="Продолжите, чтобы пользоваться ИИ-клиентом и маркетплейсом."
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-brand-300 hover:text-brand-200">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      {user && (
        <div className="mb-5 rounded-xl border border-gold-400/30 bg-gold-400/8 p-3.5 text-xs leading-relaxed text-gold-200">
          Вы уже вошли как <b>{user.name}</b>.{' '}
          <button onClick={signOut} className="underline underline-offset-2 hover:text-white">
            Выйти
          </button>{' '}
          и войти в другой аккаунт.
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2">
        <Button variant="subtle" size="sm" onClick={google} loading={googleLoading}>
          Google
        </Button>
        <Link to="/register" className="block">
          <Button variant="subtle" size="sm" full>
            Регистрация
          </Button>
        </Link>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-widest text-white/25">или по email</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail size={15} />}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordInput
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/50">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-white/20 bg-ink-900 accent-brand-500"
            />
            Запомнить меня
          </label>
          <Link to="/forgot" className="text-xs font-semibold text-brand-300 hover:text-brand-200">
            Забыли пароль?
          </Link>
        </div>

        <Button type="submit" full size="lg" loading={loading} icon={<ArrowRight size={16} />}>
          Войти
        </Button>
      </form>

      <DemoHint onUse={() => { setEmail('artem@jarwis.gg'); setPassword('jarwis2026') }} />
    </AuthLayout>
  )
}

/* ─────────────────────────────────────────────
   Страница регистрации
   ───────────────────────────────────────────── */
export function Register() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaOk, setCaptchaOk] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      name: validators.name(name),
      email: validators.email(email),
      password: validators.password(password),
      captcha: captchaOk === false ? 'Неверный код капчи' : '',
      agree: agree ? '' : 'Нужно принять условия',
    }
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setLoading(true)
    try {
      const account = await signUp(name, email, password)
      toast.success('Аккаунт создан!', 'Добро пожаловать в Jarwis. Начните с бесплатного тарифа.')
      navigate('/cabinet/buyer', { replace: true })
      return account
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Аккаунт создан через Google')
      navigate('/cabinet/buyer', { replace: true })
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Бесплатно. Без привязки карты. Отмена в любой момент."
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Войти
          </Link>
        </>
      }
    >
      <div className="mb-5">
        <GoogleButton onClick={google} loading={googleLoading} />
      </div>

      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-widest text-white/25">или по email</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как к вам обращаться"
          icon={<User size={15} />}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail size={15} />}
          error={errors.email}
          autoComplete="email"
        />

        <div>
          <PasswordInput
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 8 символов"
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordStrength value={password} />
        </div>

        {/* Капча */}
        <div>
          <p className="label">Подтверждение</p>
          <Captcha value={captcha} onChange={setCaptcha} onVerify={setCaptchaOk} />
          {errors.captcha && <p className="mt-1.5 text-xs font-medium text-brand-400">{errors.captcha}</p>}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-white/50">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-ink-900 accent-brand-500"
          />
          <span>
            Я принимаю{' '}
            <Link to="/about" className="text-brand-300 hover:text-brand-200">
              условия использования
            </Link>{' '}
            и{' '}
            <Link to="/about" className="text-brand-300 hover:text-brand-200">
              политику конфиденциальности
            </Link>
            .
          </span>
        </label>
        {errors.agree && <p className="-mt-2 text-xs font-medium text-brand-400">{errors.agree}</p>}

        <Button type="submit" full size="lg" loading={loading} icon={<ArrowRight size={16} />}>
          Создать аккаунт
        </Button>
      </form>
    </AuthLayout>
  )
}

/* ─────────────────────────────────────────────
   Восстановление пароля
   ───────────────────────────────────────────── */
export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validators.email(email)
    setError(err)
    if (err) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Восстановление доступа"
      subtitle="Пришлём ссылку для сброса пароля на вашу почту."
      footer={
        <>
          Вспомнили пароль?{' '}
          <Link to="/login" className="font-semibold text-brand-300 hover:text-brand-200">
            Вернуться ко входу
          </Link>
        </>
      }
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
          >
            <Check size={28} />
          </motion.div>
          <h2 className="h-display text-xl">Проверьте почту</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/50">
            Мы отправили ссылку для сброса пароля на <b className="text-white">{email}</b>. Она действует 30 минут.
          </p>
          <Button variant="ghost" size="sm" className="mt-6" onClick={() => setSent(false)}>
            Отправить ещё раз
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={<Mail size={15} />}
            error={error}
          />
          <Button type="submit" full size="lg" loading={loading}>
            Отправить ссылку
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

/* ─────────────────────────────────────────────
   Подсказка с демо-аккаунтом
   ───────────────────────────────────────────── */
function DemoHint({ onUse }: { onUse: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onUse}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-5 w-full rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-3.5 text-left transition-colors hover:border-brand-500/35"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Демо-доступ</p>
      <p className="mt-1 font-mono text-[11px] text-white/50">artem@jarwis.gg · jarwis2026</p>
      <p className="mt-1.5 text-[11px] text-white/30">Нажмите, чтобы заполнить форму</p>
    </motion.button>
  )
}
