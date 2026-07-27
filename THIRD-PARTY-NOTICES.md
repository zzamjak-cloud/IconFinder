# Third-Party Notices

IconFinder is distributed under the [MIT License](./LICENSE).
It includes or depends on the following third-party software. Each component
remains under its own license, reproduced or referenced below.

## Icon data (not bundled)

IconFinder does **not** bundle any icon sets. Icons are fetched at runtime from
the public [Iconify](https://iconify.design) API (`api.iconify.design`). Every
icon is licensed under the policy of its own icon set (e.g. Lucide — ISC,
Tabler — MIT, Material Design Icons — Apache 2.0, Game Icons — CC BY 3.0,
OpenMoji — CC BY-SA 4.0). When you export and use an icon, you are responsible
for complying with that icon set's license, including attribution where
required. The in-app License dialog summarizes the licenses of the curated
collections.

## Bundled JavaScript / TypeScript dependencies

| Component | License |
|---|---|
| [React](https://github.com/facebook/react) / react-dom | MIT |
| [Tauri API & plugins](https://github.com/tauri-apps/tauri) (`@tauri-apps/*`) | MIT or Apache-2.0 |
| [TanStack Query](https://github.com/TanStack/query) | MIT |
| [TanStack Virtual](https://github.com/TanStack/virtual) | MIT |
| [Zustand](https://github.com/pmndrs/zustand) | MIT |
| [Lucide](https://github.com/lucide-icons/lucide) (`lucide-react`, UI icons) | ISC |
| [shadcn/ui](https://github.com/shadcn-ui/ui) (vendored in `src/components/ui/`) | MIT |
| [clsx](https://github.com/lukeed/clsx) | MIT |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | MIT |
| [class-variance-authority](https://github.com/joe-bell/cva) | Apache-2.0 |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (build-time) | MIT |
| [Vite](https://github.com/vitejs/vite) (build-time) | MIT |
| [TypeScript](https://github.com/microsoft/TypeScript) (build-time) | Apache-2.0 |

## Bundled Rust dependencies (direct)

| Component | License |
|---|---|
| [tauri](https://github.com/tauri-apps/tauri) + official plugins | MIT or Apache-2.0 |
| [serde](https://github.com/serde-rs/serde) / serde_json | MIT or Apache-2.0 |
| [dirs](https://github.com/dirs-dev/dirs-rs) | MIT or Apache-2.0 |
| [ico](https://github.com/mdsteele/rust-ico) | MIT |
| [icns](https://github.com/mdsteele/rust-icns) | MIT |

Transitive dependencies are governed by their own licenses; see
`package-lock.json` and `src-tauri/Cargo.lock` for the full dependency trees.

---

## License texts

### MIT License

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### ISC License (Lucide)

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part
of Feather (MIT). All other copyright (c) for Lucide are held by Lucide
Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
```

### Apache License 2.0

Components marked "Apache-2.0" (or dual "MIT or Apache-2.0") are licensed under
the Apache License, Version 2.0. A copy of the license is available at:

<https://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software distributed
under the Apache License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
