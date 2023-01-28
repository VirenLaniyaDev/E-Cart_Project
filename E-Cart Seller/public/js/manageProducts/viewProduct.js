const bar5 = document.getElementById('bar-5');
const bar4 = document.getElementById('bar-4');
const bar3 = document.getElementById('bar-3');
const bar2 = document.getElementById('bar-2');
const bar1 = document.getElementById('bar-1');

const star5 = +(bar5.dataset.star5);
const star4 = +(bar4.dataset.star4);
const star3 = +(bar3.dataset.star3);
const star2 = +(bar2.dataset.star2);
const star1 = +(bar1.dataset.star1);
const productRatedBy = +(document.getElementById('user-ratings').dataset.productRatedBy);

const calWidth_star5 = (star5 * 100) / productRatedBy;
const calWidth_star4 = (star4 * 100) / productRatedBy;
const calWidth_star3 = (star3 * 100) / productRatedBy;
const calWidth_star2 = (star2 * 100) / productRatedBy;
const calWidth_star1 = (star1 * 100) / productRatedBy;

bar5.style.width = `${calWidth_star5}%`;
bar4.style.width = `${calWidth_star4}%`;
bar3.style.width = `${calWidth_star3}%`;
bar2.style.width = `${calWidth_star2}%`;
bar1.style.width = `${calWidth_star1}%`;