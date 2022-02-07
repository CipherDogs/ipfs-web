<template>
    <div>
        <h1>IPFS Test page</h1>
        <hr />
        <p>Status: {{ info.status }}</p>
        <p>ID: {{ info.peerId }}</p>
        <hr />
        <h2>Log</h2>
        <div v-if="info.status">
            <textarea
                v-model="log"
                ref="log"
                readonly
                style="width: 620px; height: 200px; resize: none"
            ></textarea>
        </div>
        <hr />
        <div v-if="info.status">
            <p>Add "Hello, world!"</p>
            <button @click="addText">Add Text</button>
            <p>{{ textCID }}</p>
            <hr />
            <p>Add file to IPFS</p>
            <input type="file" @change="addFile" />
            <p>{{ fileCID }}</p>
            <hr />
            <p>Cat file from IPFS (image/png)</p>
            <input type="text" v-model="getCID" />
            <button @click="getFile">Get File</button>
            <br />
            <img v-for="item in urls" v-bind:key="item" :src="item" />
        </div>
    </div>
</template>
            
<script>
import * as IPFS from "helia";
import { strings } from "@helia/strings";
import { unixfs } from "@helia/unixfs";
import { CID } from "multiformats/cid";

export default {
    name: "Home",
    data() {
        return {
            ipfs: undefined,
            info: {
                status: false,
                peerId: "",
            },
            log: "",
            textCID: "",
            fileCID: "",
            getCID: "",
            urls: [],
        };
    },
    async mounted() {
        this.ipfs = await IPFS.createHelia();

        const timerId = setInterval(async () => {
            if (!this.info.status) {
                await this.getIpfsNodeInfo();
            } else {
                clearInterval(timerId);
            }
        }, 100);

        this.ipfs.libp2p.addEventListener("peer:discovery", (evt) => {
            this.log += `Discovered peer ${evt.detail.id.toString()}\n`;
        });

        this.ipfs.libp2p.addEventListener("peer:connect", (evt) => {
            this.log += `Connected to ${evt.detail.toString()}\n`;
        });

        this.ipfs.libp2p.addEventListener("peer:disconnect", (evt) => {
            this.log += `Disconnected from ${evt.detail.toString()}\n`;
        });
    },
    watch: {
        log: function () {
            let { log } = this.$refs;
            try {
                log.scrollTop = log.scrollHeight;
            } catch {
                log.scrollTop = 0;
            }
        },
    },
    methods: {
        async getIpfsNodeInfo() {
            try {
                this.info.status = this.ipfs.libp2p.isStarted();
                this.info.peerId = this.ipfs.libp2p.peerId.toString();
            } catch {
                this.info.status = false;
            }
        },
        async addText() {
            const s = strings(this.ipfs);
            const CID = await s.add("Hello, world!");
            this.textCID = CID.toString();
        },
        async addFile(event) {
            const fs = unixfs(this.ipfs);

            const arrBuffer = await event.target.files[0].arrayBuffer();
            const byteArray = new Uint8Array(arrBuffer);

            const CID = await fs.addBytes(byteArray);
            this.fileCID = CID.toString();
        },
        async getFile() {
            const fs = unixfs(this.ipfs);

            this.urls = [];
            for await (const chunk of fs.cat(CID.parse(this.getCID))) {
                let blob = new Blob([chunk], { type: "image/png" });
                this.urls.push(URL.createObjectURL(blob));
            }
        },
    },
};
</script>
