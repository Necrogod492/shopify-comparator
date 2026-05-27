document.addEventListener("DOMContentLoaded", function () {
    const compareBtn = document.getElementById("compare-button");
    const MAX_PRODUCTS = 4;
    const MIN_PRODUCTS = 2;

    if (!compareBtn) return;

    const currentProduct = {
        id: compareBtn.getAttribute("data-product-id"),
        title: compareBtn.getAttribute("data-product-title"),
        handle: compareBtn.getAttribute("data-product-handle"),
        image: compareBtn.getAttribute("data-product-image"),
        price: compareBtn.getAttribute("data-product-price")
    };

    // Configuration de base du Toast SweetAlert2
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    function getCompareList() {
        return JSON.parse(localStorage.getItem("shopify_compare_list")) || [];
    }

    function saveCompareList(list) {
        localStorage.setItem("shopify_compare_list", JSON.stringify(list));
    }

    function updateCompareButton() {
        const compareList = getCompareList();
        const isInCompare = compareList.some(item => item.id === currentProduct.id);
        const isMaxReached = compareList.length >= MAX_PRODUCTS;

        if (isInCompare) {
            compareBtn.innerText = "✓ Ajouté";
            compareBtn.classList.add("is-active");
        } else if (isMaxReached) {
            compareBtn.classList.remove("is-active");
            compareBtn.textContent = "Limite atteinte (Max 4)";
        } else {
            compareBtn.innerText = "Ajouter au comparateur";
            compareBtn.classList.remove("is-active");
        }
    }

    compareBtn.addEventListener("click", function () {
        let compareList = getCompareList();
        const isInCompare = compareList.some(item => item.id === currentProduct.id);
        const hasActiveClassName = compareBtn.classList.contains("is-active");
        const isMaxReached = compareList.length >= MAX_PRODUCTS;

        if (isMaxReached && !hasActiveClassName) {
            Toast.fire({
                icon: 'warning',
                title: 'Limite atteinte',
                text: 'Vous ne pouvez pas ajouter plus de 4 produits.'
            });
            
            return; 
        }

        if (isInCompare) {
            compareList = compareList.filter(item => item.id !== currentProduct.id);
            saveCompareList(compareList);
            updateCompareButton();

            Toast.fire({
                icon: 'info',
                title: `Produit retiré du comparateur !`
            });
        } else {
            if (isMaxReached) {
                Toast.fire({
                    icon: 'warning',
                    title: 'Limite de 4 produits atteinte.'
                });
            }

            compareList.push(currentProduct);
            saveCompareList(compareList);
            updateCompareButton();

            Toast.fire({
                icon: 'success',
                title: `produit ajouté au comparateur !`
            });
        }
    });

    updateCompareButton();
});