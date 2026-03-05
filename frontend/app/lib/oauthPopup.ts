export function OAuthPopup(url: string, name: string, width = 600, height = 700) {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
        url,
        name,
        `width=${width},height=${height},left=${left},top=${top}`
    );

    window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== "MY_MESSAGE") return;

        console.log("Received message:", event.data.message);
    });

    popup?.postMessage(
        { type: "MY_MESSAGE", message: "hello" },
        window.location.origin
    );

    return popup;
}