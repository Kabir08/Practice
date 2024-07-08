import ProfileClient from '@/app/profile-client/page'
import React from 'react'
import Link from 'next/link'

const dashboard = () => {
  return (
    <div className='bg-blue-100 block mx-[17%] p-10'>
      <div className='flex justify-center items-center'>
      This is dashboard
      </div>
      <div className='flex items-center justify-between'>
        <div>Profile pic</div>
      <div>
      <ProfileClient/>
      </div>
      </div>
      <div className='flex justify-center m-5 bg-blue-800 rounded-md p-2 w-[200px] items-center'>
      <Link href="/pages/EditInfo">
          Tell us more
        </Link>
      </div>


    </div>
  )
}

export default dashboard
