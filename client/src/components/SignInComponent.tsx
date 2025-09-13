import { useState } from "react";
import { Button } from "./ui/button";
import Register from "./RegisterForm";
import Login from "./LoginForm";


const SignInComponent = () => {

    const items = [
        {title: 'Register', component: <Register />},
        {title: 'Login', component: <Login />},
    ]

    const [index, setIndex] = useState(1);

  return (
    <>
    <div className="flex flex-col max-w-xl min-w-md w-full mx-auto mt-20 p-4 ">
        <div className="flex justify-center space-x-4 bg-gray-700 rounded-lg shadow-md p-2">
            {items.map((item, idx) => (
                <Button
                    key={idx}
                    variant={index === idx ? 'default' : 'outline'}
                    className={`${index === idx ? 'text-white' : 'hover:scale-105 text-gray-300'} transition-transform`}
                    onClick={() => setIndex(idx)}
                >
                    {item.title}
                </Button>
            ))}
        </div>
        <div className="mt-4 bg-gray-500 rounded-lg shadow-md w-full p-2">
            {items.map((item, idx) => (
                <div key={idx} className={`${index === idx ? 'block' : 'hidden'}`}>
                    {item.component}
                </div>
            ))}
        </div>
        
    </div>
    </>
  )
}

export default SignInComponent