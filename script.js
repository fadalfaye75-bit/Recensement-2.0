// 🔹 Toast notification
function showToast(msg){
    const t=document.getElementById('toast');
    t.innerText=msg;
    t.style.display='block';
    setTimeout(()=> t.style.display='none',3000);
}

// 🔹 Login admin
document.getElementById("btnLogin").addEventListener("click", function(){
    const mdp = document.getElementById("adminPassword").value.trim();
    if(mdp === "NOYAU DIOGS"){
        sessionStorage.setItem("auth","true");
        document.getElementById("loginOverlay").style.display="none";
        document.getElementById("mainContent").style.display="block";
        showToast("✅ Bienvenue Admin !");
    } else {
        showToast("❌ Mot de passe incorrect !");
        document.getElementById("adminPassword").value="";
    }
});

// 🔹 Vérifier session au chargement
window.onload=function(){
    if(sessionStorage.getItem("auth")==="true"){
        document.getElementById("loginOverlay").style.display="none";
        document.getElementById("mainContent").style.display="block";
    }
    loadLocal();
}

// 🔹 Ajouter/modifier chambre
function ajouterChambre(){
    const nom=document.getElementById("nomChambre").value.trim();
    const presentes=parseInt(document.getElementById("presentes").value)||0;
    const hebergees=parseInt(document.getElementById("hebergees").value)||0;
    const litsNonOccupes=parseInt(document.getElementById("litsNonOccupes").value)||0;
    const matelas=parseInt(document.getElementById("matelas").value)||0;
    if(!nom){ showToast("⚠️ Veuillez saisir le nom !"); return; }

    const maxGarcons=parseInt(document.getElementById("maxGarcons").value);
    const maxFilles=parseInt(document.getElementById("maxFilles").value);

    // Déterminer sexe selon numéro chambre
    let sexe="Fille";
    const num=parseInt(nom.replace(/\D/g,'')); 
    if(num>=13 && num<=50) sexe="Garçon";

    const tbody=document.querySelector("#tableChambres tbody");
    let existing=Array.from(tbody.children).find(tr=>tr.children[0].innerText===nom);
    if(existing){
        existing.children[1].innerText=presentes;
        existing.children[2].innerText=hebergees;
        existing.children[3].innerText=litsNonOccupes;
        existing.children[4].innerText=matelas;
        existing.children[7].innerText=sexe;
        recalcRow(existing,maxGarcons,maxFilles);
        showToast("✅ Chambre modifiée !");
    } else {
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${nom}</td>
        <td>${presentes}</td>
        <td>${hebergees}</td>
        <td>${litsNonOccupes}</td>
        <td>${matelas}</td>
        <td></td>
        <td></td>
        <td>${sexe}</td>
        <td class="col-supprimer"><button class="btn-supprimer">❌</button></td>`;
        tbody.appendChild(tr);

        // Colonnes éditables
        for(let i=1;i<=4;i++){
            tr.children[i].contentEditable=true;
            tr.children[i].addEventListener("input",()=>{
                recalcRow(tr,maxGarcons,maxFilles);
                saveLocal();
            });
        }

        // Connecter bouton supprimer
        tr.querySelector(".btn-supprimer").addEventListener("click", function(){
            supprimerChambre(this);
        });

        recalcRow(tr,maxGarcons,maxFilles);
        showToast("✅ Chambre ajoutée !");
    }

    // Reset inputs
    document.getElementById("nomChambre").value="";
    document.getElementById("presentes").value="";
    document.getElementById("hebergees").value="";
    document.getElementById("litsNonOccupes").value="";
    document.getElementById("matelas").value="";

    saveLocal();
}

// 🔹 Supprimer chambre
function supprimerChambre(btn){
    btn.closest("tr").remove();
    saveLocal();
    showToast("✅ Supprimée !");
}

// 🔹 Recalcul d'une ligne
function recalcRow(tr,maxGarcons,maxFilles){
    const matelas = parseInt(tr.children[4].innerText)||0;
    const litsNonOccupes = parseInt(tr.children[3].innerText)||0;
    const sexe = tr.children[7].innerText.toLowerCase();
    let litsAAjouter = sexe.includes("garçon") ? maxGarcons - matelas : maxFilles - matelas;
    if(litsAAjouter < 0) litsAAjouter = 0;
    tr.children[5].innerText = litsAAjouter;
    tr.children[6].innerText = litsAAjouter + litsNonOccupes;
}

// 🔹 Recalculer toutes les lignes
document.getElementById("calculer").addEventListener("click",()=>{
    const maxGarcons=parseInt(document.getElementById("maxGarcons").value);
    const maxFilles=parseInt(document.getElementById("maxFilles").value);
    document.querySelectorAll("#tableChambres tbody tr").forEach(tr=>recalcRow(tr,maxGarcons,maxFilles));
    saveLocal();
    showToast("✅ Tous les calculs mis à jour !");
});

// 🔹 Export PDF
document.getElementById("exportPDF").addEventListener("click",()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Gestion des Chambres",14,15);
    doc.autoTable({
        html:"#tableChambres",
        startY:25,
        columnStyles:{
            8:{cellWidth:0,textColor:[255,255,255]} // cache la colonne Supprimer
        }
    });
    doc.save("Gestion_Chambres.pdf");
    showToast("✅ Export PDF terminé !");
});

// 🔹 Sauvegarde locale
function saveLocal(){
    const data=[];
    document.querySelectorAll("#tableChambres tbody tr").forEach(tr=>{
        const row=[];
        for(let td of tr.children) row.push(td.innerText);
        data.push(row);
    });
    localStorage.setItem("chambresData",JSON.stringify(data));
}

// 🔹 Charger localStorage
function loadLocal(){
    const data=JSON.parse(localStorage.getItem("chambresData")||"[]");
    if(!data.length) return;
    const tbody=document.querySelector("#tableChambres tbody");
    tbody.innerHTML="";
    data.forEach(r=>{
        const tr=document.createElement("tr");
        tr.innerHTML=r.map((cell,index)=>{
            if(index===8) return `<td class="col-supprimer"><button class="btn-supprimer">❌</button></td>`;
            else return `<td>${cell}</td>`;
        }).join('');
        tbody.appendChild(tr);

        // Colonnes éditables
        for(let i=1;i<=4;i++){
            tr.children[i].contentEditable=true;
            tr.children[i].addEventListener("input",()=>{
                const maxGarcons=parseInt(document.getElementById("maxGarcons").value);
                const maxFilles=parseInt(document.getElementById("maxFilles").value);
                recalcRow(tr,maxGarcons,maxFilles);
                saveLocal();
            });
        }

        // Connecter bouton supprimer
        tr.querySelector(".btn-supprimer").addEventListener("click", function(){
            supprimerChambre(this);
        });
    });
}
