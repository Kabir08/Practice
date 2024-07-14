'use client'
import React from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { FormEvent } from 'react'
import { error } from 'console'
import { Error } from 'mongoose'

const EditInfo = () => {

  const handleSubmit = async (event:FormEvent<HTMLFormElement>) =>{
    event.preventDefault()

    const form = event.currentTarget;

    const formData = {
      username:form.username.value,
      avatar:form.avatar.value,
      paymentId:form.paymentId.value,
      paymentSecret:form.paymentSecret.value,
      instagram:form.instagram.value,
    linkedin:form.linkedin.value,
      github:form.github.value,
    };

    try{
    const response = await fetch('/api/submit', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // if(!response.ok){
    //   throw new Error(`HTTP error! Status: ${response.status.toString()}`) as any;
    // }

    const result = await response.json();
    console.log('Success:', result);
    console.log(result);}
    catch (error:any) {
      console.error('Error:', error.message);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
        <input type="text" id='username' name='username' required />
     
      <label htmlFor='avatar'>Avatar</label>
      <input type="text" name="avatar" id="avatar" />
      <label htmlFor='paymentId'>Payment Id
      </label >
        <input type="text" id='paymentId' name='paymentId'/>
      <label htmlFor='paymentSecret'>Payment Secret
      </label>
        <input type="text" id='paymentSecret' name='paymentSecret' />
      <label htmlFor='addInstagram'>Add Instagram
      </label>
        <input type="text" id='instagram' name='addInstagram' />
      <label htmlFor='addLinkedin'>Add LinkedIn
      </label>
        <input type="text" id='linkedin' name='addLinkedin' />
      <label htmlFor='addGithub'>Add Github
      </label>
        <input type="text" id='github' name='addGithub' />
      {/* <label htmlFor='addHashtags'>Add Hashtags
      </label>
        <input type="text"  name='addHashtags' /> */}

        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default EditInfo
