import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to Stride</h1>
        <form className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
        <div className="text-center text-sm text-gray-500">
          Or continue without an account
          <Button variant="link" className="w-full mt-2">
            Login Anonymously
          </Button>
        </div>
      </div>
    </div>
  )
}
