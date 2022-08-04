import Homepage from 'src/components/homepage'
import { page } from 'web-init'
import { useGlobal } from 'web-utils'
import { GlobalHome } from '../global/home'

export default page({
  url: '/',
  component: ({}) => {
    const meta = useGlobal(GlobalHome)
    return <div>
      <>Home</>
      <h1>{meta.title}</h1>
      <h2>{meta.subtitle}</h2>
      <h3>{meta.counter}</h3>
      <button onClick={() => {
        meta.counter++;
        console.log(meta.counter)
        meta.render()
      }}>Counter</button>

      <Homepage/>
    </div>
  }
})