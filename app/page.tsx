import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/dashboard')
} 
const handleSubmit = async () => {
  if (!form.name || !form.class || !form.total_fee) {
    alert('Name, Class aur Fee required hai!')
    return
  }
  setLoading(true)
  
  const { data, error } = await supabase.from('students').insert({
    name: form.name,
    class: form.class,
    mobile: form.mobile,
    guardian_name: form.guardian_name,
    address: form.address,
    total_fee: Number(form.total_fee),
    academic_year: form.academic_year
  }).select()
  
  console.log('Result:', data, 'Error:', error)
  
  if (error) {
    alert('Error: ' + error.message)
    setLoading(false)
    return
  }
  
  setSuccess(true)
  setLoading(false)
  setTimeout(() => router.push('/students'), 1200)
}