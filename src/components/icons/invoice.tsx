import Image from 'next/image'
import React from 'react'

export default function Invoice() {
  return (
    <Image alt='invoice icon' src='/images/invoice.svg' width={78} height={78} className='w-[78px] h-[78px]' />
  )
}
