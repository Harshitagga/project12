document.addEventListener("DOMContentLoaded", () => {
    const autocompleteInput = document.getElementById('autocomplete-input');
    const suggestionsList = document.getElementById('suggestions-list');
    const doctorList = document.getElementById('doctor-list');
    const specialtiesFilter = document.getElementById('specialties-filter');
    
    let doctorsData = [];

    // Fetch the doctor data from the API
    fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json')
        .then(response => response.json())
        .then(data => {
            doctorsData = data;
            renderSpecialtiesFilter(data);
            renderDoctorsList(data);
        })
        .catch(error => console.error('Error fetching data:', error));

    // Handle Autocomplete Search
    autocompleteInput.addEventListener('input', () => {
        const query = autocompleteInput.value.toLowerCase();
        const matches = doctorsData.filter(doctor =>
            doctor.name.toLowerCase().includes(query)
        ).slice(0, 3);

        suggestionsList.innerHTML = matches.map(doctor =>
            `<div class="suggestion-item" data-testid="suggestion-item">${doctor.name}</div>`
        ).join('');

        // Filter doctor list based on autocomplete
        suggestionsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                autocompleteInput.value = e.target.textContent;
                filterDoctors();
            }
        });
    });

    // Render Doctor Cards
    function renderDoctorsList(doctors) {
        doctorList.innerHTML = doctors.map(doctor =>
            `<div class="doctor-card" data-testid="doctor-card">
                <h4 data-testid="doctor-name">${doctor.name}</h4>
                <p data-testid="doctor-specialty">${doctor.specialties.join(', ')}</p>
                <p data-testid="doctor-experience">Experience: ${doctor.experience} years</p>
                <p data-testid="doctor-fee">Fee: ₹${doctor.fee}</p>
            </div>`
        ).join('');
    }

    // Filter Doctors by Specialties, Consultation Mode, Sort
    function filterDoctors() {
        let filteredDoctors = doctorsData;

        // Apply filters
        const consultationMode = document.querySelector('input[name="consultation-mode"]:checked')?.value;
        if (consultationMode) {
            filteredDoctors = filteredDoctors.filter(doctor => doctor.consultationMode === consultationMode);
        }

        const selectedSpecialties = Array.from(specialtiesFilter.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        if (selectedSpecialties.length > 0) {
            filteredDoctors = filteredDoctors.filter(doctor =>
                selectedSpecialties.some(specialty => doctor.specialties.includes(specialty))
            );
        }

        const sortOption = document.querySelector('input[name="sort"]:checked')?.value;
        if (sortOption === 'fees') {
            filteredDoctors.sort((a, b) => a.fee - b.fee);
        } else if (sortOption === 'experience') {
            filteredDoctors.sort((a, b) => b.experience - a.experience);
        }

        // Render the filtered list
        renderDoctorsList(filteredDoctors);
    }

    // Render Specialty Filters
    function renderSpecialtiesFilter(data) {
        const specialties = [...new Set(data.flatMap(doctor => doctor.specialties))];
        specialtiesFilter.innerHTML = specialties.map(specialty =>
            `<label>
                <input type="checkbox" value="${specialty}" data-testid="filter-specialty-${specialty}">
                ${specialty}
            </label>`
        ).join('');
        
        specialtiesFilter.addEventListener('change', filterDoctors);
    }

    // Event listener for filter changes
    document.querySelectorAll('input[name="consultation-mode"], input[name="sort"]').forEach(input =>
        input.addEventListener('change', filterDoctors)
    );
});
