const mainSlider = new Swiper('.main-slider', {

    autoplay: {
        delay: 3000,
        disableOnInteraction: false
    },

    // Optional parameters
    direction: 'horizontal',
    loop: true,

    // If we need pagination
    pagination: {
        el: '.main-slider-pagination',
        clickable: true
    },

    // Navigation arrows
    navigation: {
        nextEl: '.main-slider-next',
        prevEl: '.main-slider-prev',
    },
});