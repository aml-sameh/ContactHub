var contacts = JSON.parse(localStorage.getItem("contacts")) || [];
var avatarColors = [
    "linear-gradient(135deg, #a855f7, #7c3aed)",
    "linear-gradient(135deg, #ffa31a, #f36b1c)",
    "linear-gradient(135deg, #4d9bff, #1f6feb)",
    "linear-gradient(135deg, #22c55e, #15935a)",
    "linear-gradient(135deg, #f472b6, #db2777)",
    "linear-gradient(135deg, #14b8a6, #0f766e)"
];
var phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var fullName = document.getElementById("fullName");
var phoneNumber = document.getElementById("phoneNumber");
var emailAddress = document.getElementById("emailAddress");
var address = document.getElementById("address");

var nameError = document.getElementById("nameError");
var phoneError = document.getElementById("phoneError");
var emailError = document.getElementById("emailError");

var contactForm = document.getElementById("contactForm");
var contactModal = document.getElementById("addContactModal");
var modalTitle = document.querySelector(".modal-title");
var contactPhoto = document.getElementById("contactPhoto");
var photoPreview = document.getElementById("photoPreview");

var contactsContainer = document.getElementById("contactsContainer");
var favoritesContainer = document.getElementById("favoritesContainer");
var emergencyContainer = document.getElementById("emergencyContainer");
var searchInput = document.getElementById("searchInput");

var totalCount = document.getElementById("totalCount");
var favoriteCount = document.getElementById("favoriteCount");
var emergencyCount = document.getElementById("emergencyCount");
var contactsSubtitle = document.getElementById("contactsSubtitle");

var editIndex = -1;
var currentPhoto = "";


function saveToStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function (word) {
            return Array.from(word)[0];
        })
        .join("")
        .toUpperCase();
}

function avatarHTML(contact) {

    if (contact.photo) {
        return `<div class="contact-avatar has-photo" style="background-image: url('${escapeHTML(contact.photo)}')"></div>`;
    }

    return `<div class="contact-avatar" style="background: ${avatarColors[contact.colorIndex]}">${escapeHTML(getInitials(contact.name))}</div>`;
}

function setPhotoPreview(photo) {
    photoPreview.style.backgroundImage = photo ? "url('" + photo + "')" : "";
    photoPreview.classList.toggle("has-photo", photo != "");
}


function validateName() {
    var isValid = fullName.value.trim() != "";

    nameError.textContent = isValid ? "" : "Please enter your name";

    return isValid;
}

function validatePhone() {
    var isValid = phoneRegex.test(phoneNumber.value.trim());

    phoneError.textContent = isValid ? "" : "Please enter a valid Egyptian phone number";

    return isValid;
}

function validateEmail() {
    var email = emailAddress.value.trim();
    var isValid = email == "" || emailRegex.test(email);

    emailError.textContent = isValid ? "" : "Please enter a valid email address";

    return isValid;
}


function getFilteredContacts() {

    var searchValue = searchInput.value.trim().toLowerCase();

    return contacts.filter(function (contact) {
        return (
            contact.name.toLowerCase().includes(searchValue) ||
            contact.phone.includes(searchValue) ||
            contact.email.toLowerCase().includes(searchValue)
        );
    });
}

function displayContacts(list) {

    if (list.length == 0) {

        contactsContainer.innerHTML = `
            <div class="col-12">
                <div class="empty-contacts">
                    ${contacts.length == 0 ? "No contacts yet" : "No contacts found"}
                </div>
            </div>
        `;

        return;
    }

    var html = "";

    list.forEach(function (contact) {

        var index = contacts.indexOf(contact);

        html += `
            <div class="col-12 col-md-6">

                <div class="contact-card">

                    <div class="contact-content">

                        <div class="d-flex align-items-center gap-3 mb-3">

                            <div class="avatar-box">

                                ${avatarHTML(contact)}

                                ${contact.favorite
                                    ? `<div class="favorite-mark"><i class="fa-solid fa-star"></i></div>`
                                    : ""}

                                ${contact.emergency
                                    ? `<div class="emergency-mark"><i class="fa-solid fa-heart-pulse"></i></div>`
                                    : ""}

                            </div>

                            <div class="contact-title">

                                <h5 class="contact-name mb-1 fw-bold">
                                    ${escapeHTML(contact.name)}
                                </h5>

                                <div class="contact-phone d-flex align-items-center gap-2">

                                    <span class="info-icon phone-icon">
                                        <i class="fa-solid fa-phone"></i>
                                    </span>

                                    <span>${escapeHTML(contact.phone)}</span>

                                </div>

                            </div>

                        </div>

                        ${contact.email
                            ? `
                                <div class="contact-info">
                                    <span class="info-icon email-icon">
                                        <i class="fa-solid fa-envelope"></i>
                                    </span>
                                    <span>${escapeHTML(contact.email)}</span>
                                </div>
                            `
                            : ""}

                        ${contact.address
                            ? `
                                <div class="contact-info">
                                    <span class="info-icon address-icon">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </span>
                                    <span>${escapeHTML(contact.address)}</span>
                                </div>
                            `
                            : ""}

                        ${contact.emergency
                            ? `
                                <div class="emergency-badge">
                                    <i class="fa-solid fa-heart-pulse"></i>
                                    Emergency
                                </div>
                            `
                            : ""}

                    </div>

                    <div class="contact-actions">

                        <div class="d-flex gap-2">

                            <a href="tel:${escapeHTML(contact.phone)}" class="action-btn call-btn">
                                <i class="fa-solid fa-phone"></i>
                            </a>

                            ${contact.email
                                ? `
                                    <a href="mailto:${escapeHTML(contact.email)}" class="action-btn email-btn">
                                        <i class="fa-solid fa-envelope"></i>
                                    </a>
                                `
                                : ""}

                        </div>

                        <div class="d-flex gap-3">

                            <button class="action-icon favorite-btn ${contact.favorite ? "active" : ""}"
                                data-index="${index}">
                                <i class="${contact.favorite ? "fa-solid fa-star" : "fa-regular fa-star"}"></i>
                            </button>

                            <button class="action-icon emergency-btn ${contact.emergency ? "active" : ""}"
                                data-index="${index}">
                                <i class="${contact.emergency ? "fa-solid fa-heart-pulse" : "fa-regular fa-heart"}"></i>
                            </button>

                            <button class="action-icon edit-btn" data-index="${index}">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button class="action-icon delete-btn" data-index="${index}">
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `;
    });

    contactsContainer.innerHTML = html;
}

function renderSideList(container, list, emptyText, itemClass, callClass) {

    if (list.length == 0) {
        container.className = "empty-state";
        container.innerHTML = emptyText;
        return;
    }

    container.className = "side-list";

    var html = "";

    list.forEach(function (contact) {

        html += `
            <div class="side-contact ${itemClass}">

                <div class="side-contact-info">

                    ${avatarHTML(contact)}

                    <div class="side-contact-text">
                        <span class="side-contact-name">${escapeHTML(contact.name)}</span>
                        <small class="side-contact-phone">${escapeHTML(contact.phone)}</small>
                    </div>

                </div>

                <a href="tel:${escapeHTML(contact.phone)}" class="action-btn ${callClass}">
                    <i class="fa-solid fa-phone"></i>
                </a>

            </div>
        `;
    });

    container.innerHTML = html;
}

function refresh() {

    var favorites = contacts.filter(function (contact) {
        return contact.favorite;
    });

    var emergencies = contacts.filter(function (contact) {
        return contact.emergency;
    });

    displayContacts(getFilteredContacts());

    renderSideList(favoritesContainer, favorites, "No favorites yet", "favorite-contact", "call-btn");
    renderSideList(emergencyContainer, emergencies, "No emergency contacts", "emergency-contact", "emergency-call-btn");

    totalCount.textContent = contacts.length;
    favoriteCount.textContent = favorites.length;
    emergencyCount.textContent = emergencies.length;

    contactsSubtitle.textContent =
        "Manage and organize your " +
        contacts.length +
        (contacts.length == 1 ? " contact" : " contacts");
}


function saveContact() {

    var validName = validateName();
    var validPhone = validatePhone();
    var validEmail = validateEmail();

    if (!validName || !validPhone || !validEmail) {
        return;
    }

    var name = fullName.value.trim();
    var phone = phoneNumber.value.trim();
    var email = emailAddress.value.trim();
    var userAddress = address.value.trim();

    var isEdit = editIndex != -1;

    if (isEdit) {

        contacts[editIndex].name = name;
        contacts[editIndex].phone = phone;
        contacts[editIndex].email = email;
        contacts[editIndex].address = userAddress;
        contacts[editIndex].photo = currentPhoto;

    } else {

        contacts.push({
            name: name,
            phone: phone,
            email: email,
            address: userAddress,
            photo: currentPhoto,
            favorite: false,
            emergency: false,
            colorIndex: contacts.length % avatarColors.length
        });

    }

    saveToStorage();
    refresh();

    bootstrap.Modal.getInstance(contactModal).hide();

    Swal.fire({
        icon: "success",
        title: isEdit ? "Updated!" : "Added!",
        text: isEdit
            ? "Contact has been updated successfully."
            : "Contact has been added successfully.",
        confirmButtonColor: "#6535f5"
    });
}

function editContact(index) {

    var contact = contacts[index];

    editIndex = index;

    fullName.value = contact.name;
    phoneNumber.value = contact.phone;
    emailAddress.value = contact.email;
    address.value = contact.address;

    currentPhoto = contact.photo || "";
    setPhotoPreview(currentPhoto);

    modalTitle.textContent = "Edit Contact";

    bootstrap.Modal.getOrCreateInstance(contactModal).show();
}

function deleteContact(index) {

    Swal.fire({
        icon: "warning",
        title: "Delete Contact?",
        text: "Are you sure you want to delete " + contacts[index].name + "? This action cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280"
    }).then(function (result) {

        if (result.isConfirmed) {

            contacts.splice(index, 1);

            saveToStorage();
            refresh();

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Contact has been deleted successfully.",
                confirmButtonColor: "#6535f5"
            });
        }
    });
}

function toggleFlag(index, flag) {
    contacts[index][flag] = !contacts[index][flag];

    saveToStorage();
    refresh();
}


contactsContainer.addEventListener("click", function (e) {

    var button = e.target.closest(".action-icon");

    if (!button) {
        return;
    }

    var index = Number(button.dataset.index);

    if (button.classList.contains("favorite-btn")) {
        toggleFlag(index, "favorite");
    } else if (button.classList.contains("emergency-btn")) {
        toggleFlag(index, "emergency");
    } else if (button.classList.contains("edit-btn")) {
        editContact(index);
    } else if (button.classList.contains("delete-btn")) {
        deleteContact(index);
    }
});

searchInput.addEventListener("input", function () {
    displayContacts(getFilteredContacts());
});

contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveContact();
});

phoneNumber.addEventListener("focus", validatePhone);
phoneNumber.addEventListener("input", validatePhone);
emailAddress.addEventListener("input", validateEmail);

contactPhoto.addEventListener("change", function () {

    var file = contactPhoto.files[0];

    if (!file) {
        return;
    }

    var reader = new FileReader();

    reader.onload = function () {

        var img = new Image();

        img.onload = function () {

            var size = 200;
            var side = Math.min(img.width, img.height);
            var canvas = document.createElement("canvas");

            canvas.width = size;
            canvas.height = size;

            canvas.getContext("2d").drawImage(
                img,
                (img.width - side) / 2,
                (img.height - side) / 2,
                side,
                side,
                0,
                0,
                size,
                size
            );

            currentPhoto = canvas.toDataURL("image/jpeg", 0.8);
            setPhotoPreview(currentPhoto);
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);

    contactPhoto.value = "";
});

contactModal.addEventListener("shown.bs.modal", function () {
    fullName.focus();
});

contactModal.addEventListener("hidden.bs.modal", function () {

    editIndex = -1;
    currentPhoto = "";

    modalTitle.textContent = "Add New Contact";

    contactForm.reset();
    setPhotoPreview("");

    nameError.textContent = "";
    phoneError.textContent = "";
    emailError.textContent = "";
});


contacts.forEach(function (contact, i) {
    if (contact.colorIndex === undefined) {
        contact.colorIndex = i % avatarColors.length;
    }
});

saveToStorage();
refresh();