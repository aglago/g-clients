import Image from 'next/image'
import React from 'react'

export default function Logout() {
  return (
    <Image alt='logout icon' src='/images/logout.svg' width={24} height={24} className='w-[24px] h-[24px]' />
  )
}
