import styles from './dashboardLayout.module.scss';
import classnames from 'classnames/bind';
import Header from "@/components/layout/Header";

const cx =  classnames.bind(styles);

export default function RootLayout({
   children,
 }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={cx('wrap')}>
      <Header/>
      <main>
        {children}
      </main>
    </div>
  );
}
