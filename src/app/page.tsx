/// Using a direct relative path avoids reliance on path-alias configuration
import Calculator from "../components/Calculator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Calculator />
    </main>
  )
}
