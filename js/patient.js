// js/patient.js - Patient Portal Functions
async function loadPatientDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Load patient's visits
    const { data: visits } = await supabase
        .from('visits')
        .select(`
            *,
            consultations(*),
            prescriptions(*),
            nurse_assessments(*)
        `)
        .eq('patient_id', currentUser.id)
        .order('created_at', { ascending: false });
    
    // Display visit history
    const historyContainer = document.getElementById('visitHistory');
    if (historyContainer) {
        historyContainer.innerHTML = visits.map(visit => `
            <div class="border rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold">Visit Date: ${formatDate(visit.created_at)}</p>
                        <p class="text-sm text-gray-600">Status: ${visit.status}</p>
                        ${visit.consultations?.[0] ? `
                            <p class="text-sm mt-2"><strong>Diagnosis:</strong> ${visit.consultations[0].diagnosis}</p>
                            <p class="text-sm"><strong>Treatment:</strong> ${visit.consultations[0].treatment_plan}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}