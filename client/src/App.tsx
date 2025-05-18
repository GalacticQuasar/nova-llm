import { useState } from 'react'
import './App.css'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="dark text-teal-50 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-center text-7xl font-bold font-serif">
        <span className="text-teal-300">Welcome</span>, Adventurer
      </h1>
      <div className="card my-10">
        <Button className="font-semibold font-mono" onClick={() => setCount((count) => count + 1)}>
          The count is <span className="text-teal-600">{count}</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
          <CardDescription>A most enlightening experience indeed</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Englightenment Path 1</p>
        </CardContent>
        <CardFooter>
          <p>Englightenment Path 2</p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
