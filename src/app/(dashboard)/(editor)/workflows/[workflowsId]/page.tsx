import { requireAuth } from '@/lib/auth-utils';
import React from 'react'

const Page = async() => {
    await requireAuth();
  return (
    <div>Page Gap 😙</div>
  )
}

export default Page