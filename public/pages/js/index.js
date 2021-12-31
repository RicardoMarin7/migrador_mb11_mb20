const form = document.getElementById('form')


form.addEventListener('submit', e => {
    e.preventDefault()
    window.location.replace('migrate-sales')
})