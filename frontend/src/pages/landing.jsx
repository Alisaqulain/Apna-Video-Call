import React from 'react';
import "../App.css"
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function LandingPage(){
    const router=useNavigate()
    return(  
         
       
        <div className='landingpagecontainer'>
            <nav>
                <div className='navHeader'>
                    <h2>Apna Video Call</h2>
                 </div>
                <div className='navlist'>
                    <p onClick={()=>{
                        router("/sdfsdf")
                    }}>join as Guest</p>
                     <div role='button' onClick={()=>{
                        router("/auth")
                    }}>
                        <p>sing up</p>
                    </div>
                    <div role='button' onClick={()=>{
                        router("/auth")
                    }}>
                        <p>login</p>
                    </div>
                </div>
            </nav>
            <div className="landingMainContainer">
                <div>
                    <h1 ><span style={{color:"orange"}}>
                        Connect                        </span> with your Friends
</h1>
                        <p>cover a distance by Apne Video Call </p>
        <div role='button'>
        <Link to={"/auth"}>Join Now</Link>
        </div>
                </div>
                <div>
              <img src="/mobile.png" alt="image not foubd" />
                </div>
            </div>
        </div>
    )   
}