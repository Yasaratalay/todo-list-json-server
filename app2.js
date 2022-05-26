const initialApp = () => {
    handleEmployee();

    // JSON'a veri ekleme.
    $("#film-form").submit(function () {

        let userName = document.querySelector("#userName").value;
        let userSalary = document.querySelector("#userSalary").value;
        let userDepartment = $('#employeeSelect :selected').text();

        if (userName === "" && userSalary === "") {
            // Inputlar boş ise uyarı verme.
            const cardBody = document.getElementById("card-body");

            const message = document.createElement("div");
            message.className = "alert alert-danger";
            message.textContent = "Invalid Value";
            cardBody.appendChild(message);

            setTimeout(() => {
                cardBody.removeChild(message);
            }, 1500);

        } else {
            fetch('http://localhost:3000/employee', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: userName,
                        department: userDepartment,
                        salary: userSalary,
                        createdate: new Date(),
                        categorId: Number($('#employeeSelect').val())
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                })
                .then(newUser => {
                    handleEmployee();
                })
                .catch(err => console.error("Error for User Add!"))
        }
    });
}

// İlk başta tüm bilgileri getirsin.
const handleEmployee = () => {
    fetch("http://localhost:3000/employee")
        .then(response => response.json())
        .then(response => {
            setEmployee(response);
        })
}

// Tuşa bastığı anda çalışmaması için.
const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Tbody içine tüm bilgileri set etme.
const setEmployee = (employees) => {
    $("#employees td").remove();
    let tbody = document.getElementById("employees");
    employees.forEach(function (item) {
        tbody.innerHTML +=
            `
                     <tr>
                      <td>${item.id}</td>
                      <td>${item.name}</td>
                      <td>${item.department}</td>
                      <td>${item.salary}</td>
                      <td>${item.createdate ? new Date(item.createdate).toLocaleDateString() : ""}</td>
                      <td><button class = "btn btn-danger delete" data-employeeid =${item.id} >Delete</button></td>
                      <td><button type="button" class="btn btn-success staticBackdrop" data-toggle="modal" data-target="#staticBackdrop" data-updateid= ${item.id}>Update</td>
                    </tr>
                    `;
    });
    $(".btn.btn-success.staticBackdrop").click((e) => {
        let ID = $(e.target).data("updateid");
        $(".staticBackdrop .btn.btn-primary").attr("data-updateid", ID);
    });
    // İlgili veriyi silme.
    $(".btn.btn-danger.delete").on("click", function (e) {
        const employeeId = $(e.currentTarget).data("employeeid");

        // Sweet Alert Silme işlemi uyarı mesajı
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Bilgiler silinsin mi?',
            text: "Silinen bilgiler geri alınamaz.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sil',
            cancelButtonText: 'İptal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Silme işlemi başarılı.'
                })
                setTimeout(() => {
                    fetch(`http://localhost:3000/employee/${employeeId}`, {
                            method: 'DELETE'
                        })
                        .then(refUser => handleEmployee())
                        .catch(err => console.error("Delete Error!"));
                }, 3500);
            } else if (
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    '',
                    'Silme işlemi iptal edildi.',
                    'error'
                )
            }
        })

    })

    // Update 
    $(".staticBackdrop .btn.btn-primary").click((e) => {
        let updateNameElement = document.querySelector(".staticBackdrop #updateName").value;
        let updateSalaryElement = document.querySelector(".staticBackdrop #updateSalary").value;
        let updateDepartmentElement = $('#employeeSelect :selected').text();
        let ID = $(e.target).data("updateid");
        if (updateNameElement === "" || updateSalaryElement === "") {

        } else {
            fetch(`http://localhost:3000/employee/${ID}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: updateNameElement,
                        department: updateDepartmentElement,
                        salary: updateSalaryElement,
                        createdate: new Date(),
                        categorId: Number($('#employeeSelect').val())
                    }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },
                })
                .then(() => modalToggle())
                .catch(() => console.error("Update Error!"));
        }

    });

    const modalToggle = () => $(".staticBackdrop").modal("toggle");

    // Departmana göre süzme.
    $('#filterEmployee').on("change", () => {
        let valueSelect = Number($('#filterEmployee').val());
        if (valueSelect >= 1) {
            fetch(`http://localhost:3000/employee?categorId=${valueSelect}`, {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(response => setEmployee(response))
                .catch(err => console.error("Filter Error!"));
        } else {
            handleEmployee();
        }
    });

    // İsme göre alfabetik sıralama.
    $('#filterOrder').on("change", () => {
        let valueOrder = $('#filterOrder').val();
        let orderIndex = document.getElementById("filterOrder").selectedIndex;
        if (orderIndex >= 1) {
            fetch(`http://localhost:3000/employee${valueOrder}`, {
                    methot: 'GET'
                })
                .then(response => response.json())
                .then(response => setEmployee(response))
                .catch(err => console.error("Order Error!"));
        } else {
            handleEmployee();
        }

    });
}

// İçinde geçen kelimeye göre isim arama.
$("#searchEmployee").on("keydown", debounce((e) => {
    fetch(`http://localhost:3000/employee?name_like=${e.target.value}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(response => setEmployee(response))
        .catch(err => console.error("Search Error!"));
}, 500));

// Salary input ondalıklı veri girme.
$("#userSalary").on('keyup', function () {
    var n = parseInt($(this).val().replace(/\D/g, ''), 10);
    $(this).val(n.toLocaleString());
});

initialApp();