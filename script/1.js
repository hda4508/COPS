document.addEventListener('DOMContentLoaded', () => {
    const animatedPath = document.querySelector('.ekg-highlight-line');
    
    if (animatedPath) {
        const pathLength = animatedPath.getTotalLength();
        
        document.documentElement.style.setProperty('--ekg-path-length', pathLength);
        console.log("EKG Path Length set to:", pathLength); 
    }
});


document.addEventListener("DOMContentLoaded", () => {

    const targetImage = document.querySelector(".route-guidance-image15");

    if (!targetImage) {
        console.warn("대상 요소 (.route-guidance-image15)를 찾을 수 없습니다.");
        return;
    }


    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-active");
                    
                    observer.unobserve(entry.target); 
                }
            });
        }, 
        {
            threshold: 0.5 
        }
    );


    observer.observe(targetImage);
});

document.addEventListener("DOMContentLoaded", function() {

    const solution5Box = document.querySelector(".solution5-box");

    if (!solution5Box) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    
                    observer.unobserve(entry.target);
                }
            });
        }, 
        {
            threshold: 0.4 
        }
    );

    observer.observe(solution5Box);
});


document.addEventListener("DOMContentLoaded", function() {

    const citizen1s = document.querySelector(".citizen-1s");

    if (!citizen1s) {
        return;
    }


    const images = citizen1s.querySelectorAll("img");
    

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {

                    images.forEach((img, index) => {

                        setTimeout(() => {
                            img.classList.add("is-animated");
                        }, index * 200); 
                    });
                    

                    observer.unobserve(entry.target);
                }
            });
        }, 
        {

            threshold: 0.1 
        }
    );


    observer.observe(citizen1s);
});