// Script for Header
let subMenu = document.getElementById("subMenu");
let profileBtn = document.getElementsByClassName("profile-image-btn")[0];
let downIcon = document.getElementById("downIcon");
let supporterColor = "#47B5FF";

document.getElementById('profile-image-btn')?.addEventListener('click', openMenu);

function openMenu() {
    // Toggle the dropdown menu with open-menu class
    subMenu.classList.toggle("open-menu");
    // changing the color of profile button
    if (subMenu.classList.contains("open-menu")) {
        profileBtn.classList.add("change-profile-btn-bg");
    } else {
        profileBtn.classList.remove("change-profile-btn-bg");
    }
    // Changing down->up icon and up->down icon
    downIcon.classList.toggle("to-up-arrow");
}