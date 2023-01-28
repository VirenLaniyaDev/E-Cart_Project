const allCardSliders = document.querySelectorAll('.card-slide-container');
allCardSliders.forEach(cardSlider => {
  buildSwiperSlider(cardSlider);
});

function buildSwiperSlider(element) {
  let sliderIdentifier = element.dataset.id;
  return new Swiper(`#${element.id}`, {
    slidesPerView: 4,
    spaceBetween: 20,
    sliderPerGroup: 4,
    loop: false,
    centerSlide: "true",
    fade: "true",
    grabCursor: "true",
    navigation: {
      nextEl: `.card-swiper-next-${sliderIdentifier}`,
      prevEl: `.card-swiper-prev-${sliderIdentifier}`,
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      520: {
        slidesPerView: 2,
      },
      850: {
        slidesPerView: 3,
      },
      1000: {
        slidesPerView: 4,
      },
    },
  })
}

// Slicing line if line contains more then specified length of char
let maxLengthOfChar = 80;
const productTitles = document.querySelectorAll(".product-title");
productTitles.forEach(productTitle => {
  if (productTitle.textContent.length > maxLengthOfChar) {
    productTitle.textContent = productTitle.textContent.slice(0, maxLengthOfChar) + "...";
  }
})
