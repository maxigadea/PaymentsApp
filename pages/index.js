import Head from 'next/head'
import Image from 'next/image'
import Payment from '../components/payment/payment'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
     <Payment />
    </div>
  )
}
