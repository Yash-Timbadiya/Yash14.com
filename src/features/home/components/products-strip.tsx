import { cn } from "@/lib/utils";
import { ProductMarquee } from "./product-marquee";
import { BAND, FRAME } from "@/features/home/lib/styles";
import { getProducts } from "@/features/home/lib/get-products";

export function ProductsStrip() {
  const products = getProducts();

  return (
    <>
      <div className={BAND}>
        <div className={cn(FRAME, "h-10 lg:h-13")} />
      </div>
      <div className={BAND}>
        <div className={cn(FRAME, "grid lg:grid-cols-[17.5rem_minmax(0,1fr)]")}>
          <p className="flex items-center border-hairline px-5 py-3.5 text-[0.9375rem]/6 text-balance max-lg:border-b lg:px-10 lg:py-0 lg:text-base/6">
            <span>
              Trusted to ship <span className="text-heat">products</span> for
              clients
            </span>
          </p>
          <ProductMarquee products={products} />
        </div>
      </div>
    </>
  );
}
