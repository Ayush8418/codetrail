// ---------------------------------------------------------using client session 
// useSession() : uses cookies that locally stored on client side then sends req to backend(api/auth/session)
//                      which uses cookies that comes with the request then verify the JWT using Secret then make a session and that is returned to us.
// ---------------------------------------------------------using server session 
// getServerSession() : uses cookies that comes with the request then verify the JWT using Secret then make a session and that is returned to us.
"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth"

export default async function HomePage(){
  
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1>Hello, Codetrail!</h1>
      <p>you Session: <br /> {JSON.stringify(session)}</p>
      <div className="h-[1500px]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis alias, ducimus fugiat mollitia deleniti velit quos id voluptas aspernatur nesciunt libero odit officia non repudiandae quisquam accusantium, vitae perferendis ab!</div>   
    </div>
  )
}