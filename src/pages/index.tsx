import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <h1 className="text-3xl text-center">پروژه جلسه دوم</h1>
      <h2 className="text-2xl text-center mt-3">مدیریت کاربران</h2>
      <div className="w-[95%] max-w-3xl mx-auto mt-10" style={{direction: "rtl"}}>
        <p><strong>مسئله:</strong> مدریت کاربران و نشون دادن آنها به بقیه کاربران در زمان دلخواه </p>
        <p><strong>راه حل:</strong> برای حل این مسئله راه حل های زیادی وجود داره که من سه تا از اون هارو توی این پروژه به کار خواهم گرفت.</p>
        <p><strong>راه حل اول:</strong>استفاده کردن از روش IRS به صورت مستقیم و غیر فعال کردن Revalidation برای تایید و نشون دادن کاربران در زمان دلخواه</p>
        <p className="mr-3"><strong>توضیح راه حل اول:</strong> در این روش به طور کلی وقتی پروژه بیلد گرفته میشه با استفاده از getStaticPorps صفحه بیلد گرفته میشه و به کاربر نشون داده میشه
        و برای دفعات بعد وقتی صفحه رفرش میشه همون صفحه بیلد شده نشان داده میشه مگر اینکه کاربر صفحه رو Rebuild کنه ودر این صورت صفحه دوباره بیلد گرفته میشه و نشون داده میشه</p>
        <p><strong>راه حل دوم:</strong>استفاده کردن از LocalStorage</p>
        <p className="mr-3"><strong>توضیح راه حل دوم:</strong>در این روش وقتی صفحه برای اولین بار باز میشه اطلاعات از table دریافت میشه و همزمان به کاربر نشون داده میشه و در LocalStorage دخیره میشه و تا زمانی که روی دکمه Refresh کلیک نشه صفحه اطلاعات LocalStorage رو نشون میده و وقتی روی دکمه کلیک میشه دوباره اطلاعات fetch و نشون داده میشه</p>
        <p><strong>راه حل سوم:</strong>درخواست به API</p>
        <p className="mr-3"><strong>توضیح راه حل دوم:</strong>در این روش با استفاده از getStaticProps اطلاعات هنگام بیلد fetch شده و نشان داده میشوند و در صورت کلیک بر رو دکمه refresh به API خاصی درخواست زده میشه و صفحه دوباره بیلد گرفته میشه</p>
      </div>
    </>
  );
}
