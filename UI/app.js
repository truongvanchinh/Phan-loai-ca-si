Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: '/',
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some message",
        autoProcessQueue: false
    });

    // khi thêm file mới vào -> xóa file cũ
    dz.on('addedfile', function () {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on('complete', function (file) {
        let imageData = file.dataURL;

        var url = 'http://127.0.0.1:5000/classify_image';

        $.post(url, {
            image_data: imageData,
        }, function (data, status) {
            console.log(data);

            if (!data || data.length == 0) {
                $('#resultHolder').hide();
                $('#divClassTable').hide();
                $('#error').show();
            }

            let match = null;
            let bestScore = -1;
            for (let i = 0; i < data.length; i++) {
                let maxProbality = Math.max(...data[i].class_probability);
                if (maxProbality > bestScore) {
                    bestScore = maxProbality;
                    match = data[i];
                }
            }

            if (match) {
                $('#error').hide();
                $('#resultHolder').show();
                $('#divClassTable').show();
                console.log(match);
                $('#resultHolder').html($(`[data-player="${match.class}"`).html());
                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probalityScore = match.class_probability[index];
                    let elementname = '#score_' + personName;

                    $(elementname).html(probalityScore);
                }

            }
        });
    });

    $('#submitBtn').on('click', function () {
        dz.processQueue();
    });
}

$(document).ready(function () {
    console.log('Ready');
    $('#error').hide();
    $('#resultHolder').hide();
    $('#divClassTable').hide();

    init();
});