document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANTE: Mude para o link do SheetDB do Barber Cadu
    const URL_SHEETDB = "https://sheetdb.io/api/v1/iy90yzs5eyolz"; 
    
    const horaInput = document.getElementById('hora-selecionada');
    const timeSlotsContainer = document.getElementById('time-slots');
    const dataInput = document.getElementById('data');
    const horariosPadrao = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

    flatpickr("#data", {
        locale: "pt",
        minDate: "today",
        dateFormat: "d/m/Y",
        onChange: (selectedDates, dateStr) => consultarOcupados(dateStr)
    });

    function consultarOcupados(dataSelecionada) {
        timeSlotsContainer.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>Verificando cadeira...</p>";
        fetch(URL_SHEETDB)
            .then(res => res.json())
            .then(dados => {
                const ocupados = dados.filter(item => item.DATA === dataSelecionada).map(item => item.HORA);
                gerarBotoesHora(ocupados);
            })
            .catch(() => gerarBotoesHora([]));
    }

    function gerarBotoesHora(listaOcupados) {
        timeSlotsContainer.innerHTML = "";
        horaInput.value = "";
        horariosPadrao.forEach(hora => {
            const slot = document.createElement('div');
            slot.classList.add('time-slot');
            slot.innerText = hora;
            if (listaOcupados.includes(hora)) {
                slot.style.opacity = "0.2";
                slot.style.cursor = "not-allowed";
            } else {
                slot.onclick = () => {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('active'));
                    slot.classList.add('active');
                    horaInput.value = hora;
                };
            }
            timeSlotsContainer.appendChild(slot);
        });
    }

    // Máscara de Telefone
    const telInput = document.getElementById('telefone');
    telInput.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    const form = document.getElementById('agenda-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.btn-submit');
        
        if (!horaInput.value) { alert("Escolha um horário!"); return; }

        btn.innerText = "Agendando...";
        btn.disabled = true;

        const payload = {
            data: [{
                "NOME": document.getElementById('nome').value,
                "TELEFONE": telInput.value,
                "SERVIÇO": document.getElementById('servico').value,
                "DATA": dataInput.value,
                "HORA": horaInput.value
            }]
        };

        fetch(URL_SHEETDB, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(() => { window.location.href = 'sobre.html'; })
        .catch(() => { alert("Erro ao salvar."); btn.disabled = false; });
    });

    gerarBotoesHora([]);
});