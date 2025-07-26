import Image from 'next/image'
import React from 'react'

export default function Trash() {
  return (
    <Image alt='trash icon' src='/images/trash.svg' width={24} height={24} className='w-[24px] h-[24px]' />
  )
}
