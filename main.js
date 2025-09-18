const textarea = document.querySelector('.action-form textarea');
const button = document.querySelector('.button');

button.addEventListener('click', () => { //checks for empty textarea on button click
    if(textarea.value.trim() === '') {
        textarea.classList.add('error');
        setTimeout(() => {
            textarea.classList.remove('error');
            
        }, 2000); // Remove error class after 2 seconds

    } else {
        textarea.classList.remove('error');
    }
});
