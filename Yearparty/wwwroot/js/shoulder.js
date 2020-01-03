var prev = -1;

$(document).ready(puller);

function puller() {
    $('#arm').click(function (e) {
        // var arm = $(this).addClass('clicked'),
        //     delay = setTimeout(function () { arm.removeClass('clicked') }, 500);
        e.preventDefault();
        mainDraw();
    });
}

function spin() {
    draw();
}
