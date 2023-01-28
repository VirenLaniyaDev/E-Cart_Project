const popUpContainer = document.querySelectorAll('.pop-up-container');
const closeBtn = document.querySelectorAll('.pop-up-container .close-popup-btn');
for(let i=0; i<popUpContainer.length; i++){
    closeBtn[i]?.addEventListener('click', () => {
        popUpContainer[i].classList.add("d-none");
    })
}