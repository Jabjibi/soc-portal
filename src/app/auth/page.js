
// 'use client'
 
// import { useSearchParams } from 'next/navigation'
// import { useEffect } from 'react'

// export default function AuthPage() {

// const searchParams = useSearchParams()

//   const token = searchParams.get('token')


//   useEffect(() => {
//     if (token) {
//         // Store the token in localStorage or handle it as needed
//         localStorage.setItem('api-token', token)
//         window.location.href = '/'; // Redirect to the home page
//     }
//   }, [token])

//   return (
//     <div>
//         {token}
//     </div>
//   )
// }