// pages/index.js
import Image from "next/image";

const HomeWithNextImages = () => {
  const data = [
    "/sample1.webp",
    "/sample2.webp",
    "/sample3.webp",
    "/sample4.webp",
    "/sample5.webp",
    "/sample6.webp",
    "/sample7.webp",
  ];

  return (
    <div>
      <Image src='https://blog.olivierlarose.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2Fjzzgtonmw9s6%2F4N2zUG5Z5Rm5U2y7eZAhkB%2Fc8e7b86c9662ccb83d79ef090ace841e%2FArtboard-1-copy-8.jpg&w=1920&q=75'
      width={800}
      height={800}
      alt=""
      />
      <h1>Homepage with Next.js Optimized Images</h1>
      {data.map((imgSrc, index) => (
        <div key={index} style={{ margin: "50px 0", position:'relative', height: 400 }}>
          <h2>Row {index + 1}</h2>
          <Image
            src={imgSrc}
            alt={`Image ${index + 1}`}
            fill
            loading={index === 0 ? 'eager' : 'lazy'}
            priority={index === 0}
            quality={25}
            placeholder="blur"
            className=""
            blurDataURL={`data:image/webp;base64,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`}
          />
          <p>
            This is an example text block for row {index + 1}. Each row has an
            image and some text.
          </p>
        </div>
      ))}
    </div>
  );
};

export default HomeWithNextImages;
