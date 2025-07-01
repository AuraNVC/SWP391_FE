import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

/**
 * HighlightSwiper - Swiper component for displaying highlight items.
 * @param {Array} items - Array of { title, desc, image } objects.
 * @param {string} [title] - Optional section title.
 * @param {number} [delay] - Optional autoplay delay (ms).
 * @param {object} [style] - Optional style for the section container.
 */
const HighlightSwiper = ({
  items = [],
  title = "Nội Dung Nổi Bật",
  delay = 4000,
  style = {},
}) => {
  if (!items.length) return null;
  return (
    <section
      className="mb-5"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        ...style,
      }}
    >
      <h2 className="text-center fw-bold mb-4 fs-2">{title}</h2>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay, disableOnInteraction: false }}
        style={{
          minHeight: 420,
        }}
      >
        {items.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 400,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  imageRendering: "auto",
                  objectPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  padding: "24px 32px 20px 32px",
                  borderBottomLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxWidth: "70%",
                }}
              >
                <h3 className="fs-3 fw-bold mb-2" style={{ margin: 0 }}>
                  {item.title}
                </h3>
                <p className="fs-5 mb-0" style={{ margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HighlightSwiper;