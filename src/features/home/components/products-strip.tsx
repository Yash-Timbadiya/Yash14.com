import { ProductMarquee } from "./product-marquee";
import { getProducts } from "@/features/home/lib/get-products";

export function ProductsStrip() {
  const products = getProducts();

  return (
    <>
      <div className="home-band">
        <div className="home-frame h-10 lg:h-13" />
      </div>
      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
          <p className="flex items-center px-6 py-6 text-base/6 text-balance lg:px-10 lg:py-0">
            <span>
              <span className="home-heat">{products.length} products</span>{" "}
              I&rsquo;ve built and maintain
            </span>
          </p>
          <ProductMarquee products={products} />
        </div>
      </div>
    </>
  );
}
