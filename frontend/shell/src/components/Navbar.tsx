
import { Button } from './ui/button'

export const Navbar = () => {
  return (
    <header className='h-16 border-b bg-background px-6 flex items-center justify-between'>
      <div className='font-semibold'>
        AI Interview Platform 
      </div>

      <Button variant="outline">
        Sign In 
      </Button>
    </header>
  )
}


