import { gettext } from 'i18n'

const SYNC_STATUS_KEY = 'syncStatus'
const FORCE_SYNC_KEY = 'forceSyncRequestedAt'
// Single combined key (see app-side/index.js): every CRUD action here does
// exactly ONE settingsStorage.setItem call. Each write appears to trigger a
// Side Service reload, and multiple rapid writes from one action (e.g. the
// old separate folders/notes/deletedIds keys) reproducibly crashed the
// framework's own hot-reload with "exports is not defined" / "Cannot read
// properties of undefined (reading 'onInit')" — a framework-level race, not
// something in this file, but avoidable by writing once per action.
const NOTELET_DATA_KEY = 'noteletData'

// No mock data — an untouched install starts genuinely empty.
const SEED_DATA = {
  folders: [],
  notes: [],
  deletedFolderIds: [],
  deletedNoteIds: []
}

// Brand logo (96px badge from notelet.png), inlined as a data URI because the
// settings page can't load local asset files.
const LOGO_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAYKADAAQAAAABAAAAYAAAAACpM19OAAAByWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+OTY8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+OTY8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KJjLxTQAAQABJREFUeAFNvVewJOd155k+y9f13rb3aIOGaTQ8AdDA0A1BUhQlURujUWzs08bEPu/TPszsRszshFaiREAjkYToQBIkQYCwBEB4oL031/t7y1elz9rfyWoylLyoLpv5fec753/+x3xJdWDboTaHqimKoiaH0pbnmmnEcdxWtOQ9edSSw1cUXddjRWurimbwRGnrBkfETzRNNfTk+3pyTk6jqG2r81seY1UuwQ95DJU2j6ouZ+Z9vs+XeYx0VX6WPNfkPc6QvIy5lKIyIi7Ee+22DK/dNiN5VJL3+ZQfcw5exqFvaHrcDgPXU9oxY+PNKIqM2ON5GIb83NA0HsNA3ulciwt0rtg5v3xHLp4cMtzkYBi8wSk0TT7lS5qhqRo/ZUyRlsrIiFRFN23dNOQ6TNUwTENXNJ1Jc63kNHpn8ooiAuocsVwe6SNe3RRJ3TpkWolEeORXMuHkJaL50/OOCNpK1I75ZcQIuDKf6lEo3+G/dptJ8qjGGvLTDBEiZ7B1HbmEgc9VDMNS/dBxXVlSw/A8FyGmMmnf9VikWzKSsdw6GJ8hg+PfRCidt+WVCIl1UjVZYY1pqbqOvnBJV9Msy+ZjVEYxEYzFPNEz/tAfRUc+hvwwOThVZKd57ByGwjB0VolHyxLByYX4cjsZQnJ5LUw0IhFQlMybt7kuy8CBcGXWiYCiREBqO5A14gUvY0QRtUOEyA/EDpQ4jMIoZlSGKIsfRTk1pepGGPqczE5n4hDRRaZpR1HA+RGuXIaFTNScE4iOyDvJGsoZsS+VecjpbMvkLAFqyRNdC1WMSbdsm28hmXyh2NPf193bU+zpLnb15IsFTE83OWxEibCYN4IIzcQ8dRGMCC15RCg60kyOfy8gnpui43IwKhEVR2KAEbrzRzGJLNrtMBbtxkTkfWSUPEcgHDxv1muVcnlra6taKm1sbJS3SoEXAiR+ECXLaSBUURlsK46CMGTEncsmj8kARGvQoESFbr17SzqynqlUyg9CtFW3zVjV5VQG4rHGR/r37Nlz6NChicnpQqHQ1tQwjoAqdCcRELIxE+3REyhT06koedkRDeORP2STrK88dsbF45+eMBhRT2SU/P1RYmJkkchBQUuQRhCL2vhKSiyftyIeAzSi8xzBsUQsl9KOqtXqwtz8qVOnLl24sLS45jmuoeuGZgSe6JFpmCxbLKYaAwIy0+TqWDImq/Ztu42XSESUX56w1rLMjMGwrFjHykxkGLbjPXv3PvTIo9unx7EOFs11fN40bSud4cjxK86B7sgBwhsGDzxrKx5YKB8lh5hjIiPmKUIRTZa/5NLyyOAYYucQAYG/iYR4zpPkJRcXAXUOv63HaAyi4cCa2iEmJk/9wHVdz2nyiGhZb2bVarWWltfffOON61euCsBFgRq1DaXtu64IRU4r+igwz9EBbATUkY6I6N8JSMzDTimG3nK97v6+Rz772JGjR70grDstZprL5QYGBlLZTLVa29jcZBD1ZgNlFDPgSCYsdo+/sKxbZiXwJLLhAAUQI4JBAZM3kx/IoG4dndMwMaYqapMMXVQoMa7O+53vtP0WsC3gnYA0YuRcPC/m8izk0OBAsVhs1Orr6+uO43D2YiqTz+c/+ejjl3/zYnlr09L00HX4PWjFyUW+LAIXSB75vtq//fC/E5DGiNEZrBRPY6TSTc/Zs2/fU1/9cjZXmFuYt1Kp3v5BLoltf/jhh+cvXqzXm67vISAMTOAZ/cNBiRaaokma7prZRCZigOgXPCD5pqaY8n0wUX6VgIH4OBEYK8t/EVDejkKMjUEjeMSEtNAOAAMjSuCY7+DFmqIviWVhezLHRAuwLw7bshjtjm3bjx07Njw8zDjLGyvo0a4dO0LX/9FzPzh36nTatiLPRwnF7YF7SAo/K1IWoat900cYOgNLZKbBacAaPgeQIUcHDt/2hSee3CyVtsql/sGBQlf38tzKBx98cP78eYaCg0TPWDJEjMvH0ygGiKqatun7QTqdxmJ83ebMPAeqbkkHchCGIkLTCsUn64ZtQhe4Zi6Xx0e1Gi0GCk1g0J7j8Vz8InLDdqLI1HRARFADWUSRFvqcDWHzMkgYjcAJ5+9APB6NiSasZ9/e/Q899NDAWE+9Xt/aWM9lsmMjoz/9tx9dPH8W/GoHviYeqh0EAbZn23azWQco9GzPCEjWbLUsO410ZJjYmmEGUXzg4G1f++Y3Ll+9yhknp6Zx6f/87LOvvfTK8sIyJ7KNFMNlGKIJ+IIIs/dRDzDPcx0BQVX1PU83MLG253viE1l6aJmwD802Dcdp8U4+k+4u5mqVaug7dx+/Y7C/5/rlK0ocjA0O1atlaF7s+5au+Y7D2HHCTrOJFxDn7Ps4IDUIkB1K2Ko3DFhFgNJFiI9HIYpoWxhiRwxvZWn5ow8+WN9c2bl9x8DgwPVr10pbWydPnqxUyvPzc+gaokTK6ZSN5F2nZdsWeqSne0Zx5OlMlo9x5KI+mtLyvG07d37rL/8CO2o57v79B65euf7MM8+ura6bFpaXTmVsVJhVRBzwH8gE7wv0iB8N0rk0RsxyAzWtyLVSBrYRtgOMz4swRrRTmZoaX1lZUNthPpfmncrWBgI6tH+fZahXLl0IfbenWGg2q4Hb8tzmtukJ1222mrVYCdNpyw0czoZr9SPXVnTXdaDWdgrfGFkMI7FDJCRah7EkxBFPZYp9q/NLc6dPnxobHcfurly5srSwdM+9J9fW1vmfyRImbDsMAsu0YVBYk57qGupwNqggktIMCwTvHxzGsoCYaq2+e/fexcWl577/A/yCbbJ4JnLtgACSRiiYOvQXG4EuYWpYHAqLaonhQYcyadSHJ0Dj5LZpwIuV4BN0mFViyVzPRROdVpPR79+3D7C8ef1G4DpxEDXrDb6AXmTTmXKphMLjmA8cONBIjmwmgynBE6FmoFfge3AAFDSIfPAPhQ4CH8HhUDFbtDuMAuSVsm1487nTZ62UvXfv3qvXr62tr99xxx0zMzPgGL9halwI1QYtMTe9MDCBLvA2AopUxbJTTuB9+emvYTdnz549fvyOSqX67D99D55jCcbqoYqAcP5YCWgAA4AcAOomYGQYthdGcGsIFM4f84eVTe3aDZ1qtlzipK6uLrwevggwqTN5bF7XPUbBPPEXuuY43tricmljC1hzW66gN3SwrTTqrciPQJtCNscYtta2UAg8+45tO1l85I1xuIGXzmagQ7pJhNi2LGEZTA2rAXgFTQwcuqKGRHtaEAZXrlweGR2bmpq6dOkyAAKEX758hZ/wdcxfTDVx9HqubxyjYBHgXaad9gJ/+969tx8//od335uanrat1D9/7xnRTUU1dcIbBbNBZeSqsCoBWqG+PIcQAVVmGgOO7WxGtKwd2ynMMWMZBkQjgJg4LfHBfD9ioT3gAagWdFfa2TxWntksbWAvVsrK5DJgr2VbLcxHaTuuIyzVtALfB6F5CL2gv68PT7NV2UIoVtosFgqNVgUwDEMvm89Gsc9ILexKGM4t580305qJL2MBWJurV64ePnqkp6/3408+OXr0aLPZXJifs7AhFtjQUUChc6wfJgZ6ghfijCzzgQcfvHz1CuPevXv39//lB77vGwLEOsos01Ycw7YxaVRRIQ5h8QV6NM+PCsWsG6KL0eOffRyD+v4PfuB54driLELEw1mW7jQqXAIOkUpbQ72D3QM9hWIxV8hnC3k4AG5OPLNlep6Xhsd7QbNeL21uAT7ry+vVctnzxLt5LVdUN621/PrKxqKZagPGT33xs06j+fzPf2xlUvl8xvXqxa4M0owEFrRUSvdQVA+wV+K6mjHtVuBhwm7ovvLKK9/81p8tLy/PLSycOHny9KefSLQcEKtjjGkcil4cnGLNEScmVmu1jt1xfOfuPZevXN23b9+1q9feffMtlMvEoIhKJEBWlJQGwoDKrAyryvKy/hJ7wb9xj0CjppQq5SeeeHxpZalSLaOyEY4GR+a0cvnMvr177n/o3ntOnpiYGgez0KpSZWtucX52bmZm/ubcwuyFG5cXVxdn5+dW11bEajKpvv7+I4dvO3Lk8NTkBPhVKW+5HgkKpV6r4S2aTu3IscMnTtzxbz9+DieWsrH6sJDPYE/4o1QGLZRMg/CoiFisrXsmFgezQcFR77WN9Wwut2PnzoX5+bHRMafZwNlZkFiGLVyhbXhYCkwEvqYiMnP/bcfqDWdoYKhoZ59//a2sacMu4CHYOSxYYlDXNCx4U9sNnQAHoWkZA0Mg+6LsP3Rgc7O0tQlr3Xz19Vce+tyDp//bKV0jelayPcbh247v3XOw7QWL169/grstN51GEDdddCq0SALFdhSbbcWxIbOqFbTdOF7RQgiHYaYsKzM8MNrb3zu1b//he47fvHLpzKmzSibTdCMzY504cdf773xY26qm8raRU82smzLKXWac02MrFfleVC6Rc8no7ZTb0psZFw/it7yUlXabrhGpFz88d/zQnbWBZqXeuu2OOz/89BTxQ7sdZIVAgoPJgUQ938905WF0cKK+vj4MEo+DytiEmwSjLJkQ/VhLaY1W00rbTIyxY1B1x2WlMLiV5eWRkZFSadMw9XfeeefKzauWbvX1Du47uG9kcgSq+eqLr4DB+HwL9qjZcRgLdcR6oal4PuwHbtoJgxiV5GJwRgAI1uxev3ppYc4MP/WLXdnjRw4//ZWvX7sxd+HSpY3V0i9e+HWzvFnozqRzppkKbD2cGCw+dM/xk3ceyRfsUqn08m9+/8prn0Z6NoTAx6YbuFg9KMgjmLW6uspMIdzgby6XJgJ3G3U+YGoMSc/0jWMkaHvL84fGR1HlSqUyNjp66cy5C5+eNm1b2COaxmPE8DVHjbFz1EnCXvyDquZ6uojRyHGU1jfIIKBM4i7D0Gm27jh67MF7Hw796Pevv/Pp+6fqm1U9IjuQc1oJtceLYbbwmXaoAUCQKGwgVshOQlhJliAiUixylSjUlYBnftN1qq2bl2+uLq9t2zF17I4jtp2duXk9VpqZLN9t5VPecNb5z3/7jZPHDqxu3JyZv24b0ZP3Hq+11i7OL5dD3wyyDA7oDj0fteDqjWqt2NeDlRH0d/d0YeuV0pYNYiSEU0/3jUn0petMa8eeXTt27SrXqiNDQ7/55Qu4ZBSKqSIXjiggsWQ2Yh+vCgFJkUkQ1FZHJiezuWx5swQitHyXkIYY6cDBg089+RSR41uvv/PxR6fiQBGsVOxsKu+4EPkMeoE8gGU8i8pQEL5kiMi/JokZcfvoLAIiQgPZcCsKEVPGzKb0jKGlENT12as3Zq9v27nj7hN3hHHLaW0M9Bo9Ked/+85Tw/35n7/021+/8sbFy9fPnztNpHDyvrtvrJRXNtZVpwtNBRYhLgH5CLRD1+rN5u133FFv1ArFwvra2urysgQ3SU5WEmisFOqEjvT39/OE5AUOe35+nhQBEkZVRDoQJaEb7TRkUdcg79AtAkLIyOLMAnQ3CRwRupCxex+8/7Zjx954/a2XfvPy2tJW3iyovmbFaWChVWtbRlonCaOSfyCh7PEHgBK0MhDIJeON2jr+P2iTyUROcjAKLmSomLQWwwexTDMdtTXX9d94lxX4Q5tRmXqX5n7zCydv2zf22tuvvXl+bj3s3mrkas30Wx9eiA3z9oPbC2oNzYCyQLbRHmH7kBLbXl1ebLbqaAMT7OnpEXMRaGZ1RMPl4LWuW729vfwCa8Qsxf2bGj4+0UOIpVBSEZMi7qM719U1MCAxYKsFP1pbWjazds1p9vb3PPyZR1tR9LMf/bRZaeXIt2IrbThDCiZp4VQUpeU38LkktDEdgncEyphJWXTyGoA63jCUZJGkPxkkAmKgUAndSLm+auRyLSVyYz+by4dxkMoq65sLTrPdm2t/4ZE7P//A3Q1/cauyQajptos608IRKYHjuxlwM0L9RRsky49PIFgjePE9vDrAMjg0xKed1CjJWZBRMJcri4SQkdLOF4soSy6Hmm1ipXyMYFAiziWjlPgfguZmsxnhWqo+NDlBJOHWsfwMPHNkauyLX/3K4uLi2795JSw5BSOnoJcW3gmmnVUz2YaK1sWpbHc6xYWStYktrS14z5lJWqgSLSbxS5JfxJWEbZ9kB3mAWMv7Wk7p6mmkzEpOc4p2HR7PeXSltzvVk249fO/OJx976N3T71yfnf/217/+uRP77XAt0NwwrQ6PdXcVMpeuznhxEp1IrgdlFwzm4IosBgCEBkEJs9lsIg/x2KKryQuWScQB60VfsCxcGKeAgAEDmGsMAydHAbbxb1v1mq2UnV1dW6vAjIFYVQERBqZHHnv8cx9++PHlc5eMAN+fI18r0pElNHzLQNIPPPHZ/p7eXz73mziQ1CMqQuIHUivp0zhgJLxJQMQTli0RkawK04Gzm0a64cXbD+w6+cQjQZfuB61CpM+cv3r102eMyL3rcP+ff+nuq3PvvPXua5pqnbyv/dQTDwVt/+2z14r5zGMPP3Tx0o1Pz1x3QxvLkCkzXxI/wCveNGX5zTrpNLEVXbHtFIrL+BLDjqC4otssspFKSbQp8ZaGgBAw4MkoIYpem5SDn8KXR1FRMe2e7pLTFCoFj7BsHNLA6NCTTz758muvXrl0JZfvxt8R9RLNAMxhSqPg0k7p9z/28JPfvgfAuT679vGb75qqpRJqJPkaQFPSbLzwPeAJkSSpxs4/lCeIgTU/1sF2faC//+D4vFPvyvWtfXT2wpWz/drSoe1Df/2l40VlxRgybjs4/ca7V3/w/K8edUtfffL+nlxzYnhbT3rguz97cXWFiMWUlCE4gvpEVCUsjxDI96G8mCT8nooQECwCVCRUYPlJDqBvkBFhOiJCsTkpigFUkvQmX4E2UehJ28gY5fIcZ2JqW0FXLl+9qcZh02mN7dr+6BOff/ONt+ZvzOezXfVyI5fvJRlhZrMArUNGPJ3Ze9fx+75yz2agNKrBvU89dv3mfO3mTMZIE4QLBwqE6FKKAWjJ6HSyppJRFF0ypEqEvRMZFdNOFDUCpRW4M2fPXXn9xWzoHZ7U/vrp+whyHLfuKebxE/fqxfEXX/7dCy/+Elb8+QdP5NT+//P/eubSha22X2TFCTyJCgkiIyUkpmHeZDawCWCbqyEB5o0oeJ6An/iOZBi8ByqYZEvlM04CivF7sAaz5CPeIVVEmEhcfG1+ZmF5CaXXbMPKZe556H4I24Vzl2zFditOIdutQFJRxVQ2lSu4aWv6zqOf+dbnlnwF9biyOF/Wovu//ISazUdqitDbF6i2Y7ILOk4t9Kl6qpRmEoCISTtQvdWxh7Stea1q5LWk6lSrnf/9Kz3h5rBV+k9fvmNnn1aurdR087XT8z9+9f2Dh6YfffhwIUOpy/aU7u/95JVTF7bCuN+pqO2m5nk+mEMiDeslpEQVyMCiHRiHSICsIPRFZMChk0q4xaTF5BP5Qdb4nkBlHGcpgcnJwEm8tNE3MEAIen3uRthqpFSmR5BdvfeRx5aXlz59/2O7bQSNoCvTHcaG67Uz3T0ea2Row8cOffE/fnHVVWrNMJcxtmq1S4tnn3zwyLEHH3jnhV/bJvlGfIykUE3DJlCPWVr0RvLKSVY/SY8jIQp/BAtdtqbX6xff+F2mtjxslr715MO7p6qr1RWzOPL7M7M/eumDFL4xmvny5x4aG/360ODuH//s1V//9pMw6N3aJONi+IEyPjZZKVUbpQrGlcbD2zaVSglrQZSkfomMkAbqg0B4IgbFgTz5Y9UTtixvknNCg3iCpFA8NAiQ/8afffMLf/Wtwb27oMtBO5q887b8eO/v33gzqrXSsZXT02Er1ttWd64Xq4ns1NTB/Y/85deXQmU9ULZa4rvbqj231ji/oJx84u7uyVEP521l8bpoLoM01LSMBEwCuWVUuDVScCCq4rcaZjuIKmvv/uLfwpunxuONv3zi6BPHx+Y2t6L04Kuflp57EbKD8lr5/lTTXz84OPzhG2+/+faVUi1dbfpNsitduYe/+fTXvvp0V76LxBOZGKDac0U0EryLLxOfwGR5kSCPyCgxNl4JEvFSPD/f6wgvZdn4eETDI3K9OXP92WefzeeLjzzymJ3LpvOZw4cPffTB+7Hr5q2U5P0luW7qdjbUTc+2h4/se+BbX/G7lRtlb7mseOhGqJA/0NLdZ68v1Qzlka8+ZaRtloECHNFOGHBdEAeExu1LeZfnhDQCmErbtPRc1lyfuzp79p1MfeEr9+197I4dpdppJT95ZcH7/Ts3ag293ijt3N5/28FDvfbIqes3X/jN+5ubejo3FUYQKOWRxz6rm9pzz/1oZmYW3EEuHWctNoVL7fAY9ChRHEp+cuE/lZ4ZGpbFwc8ScbXBdklzgCSW7eGWkgLW7MyN2f/6d0Njo16r9dRXv9SYX9k4fy1nFwSqQGVLtdJ50vTgTn731IP/y1dqGeX8ck0Fm/y4vtlQhouhR8cFmTT7k2ubjx4fPXr2yNk33hbIJBWp20oYk+sm9qCowvLyP+QkHREQazhJEBR6qU3XTx4d/Q+P315qnQu1rdnK9A9/8ebqamRG7h139T/24N7BVN/MbP2ZH356cyO3VbF37ti2a+LYz3/0o9d++SuK0LaXkXBPM0i/CPsmxgJwk4OJM334MMJASURpEiIresUXRH90EVBHwfgxuoNCMXme9/f3oUQgWEG1K2sbxZ4e3OHlU6dt1jvhRzBCcn5Edapl909OPPmtb8QFZb4ZN+JwpVwh01SvSXYw8NVGyyca3Wo2N+us6qODg4MMUScFp8HUY0NsCoaLc+NPSoLJiio2yZtsKvCdvbunvvbFRwJ3vdHaIGH//G/eXVxtxb6xa3rqvhP7+7oMiPpPfvjilZuVpp9vK7lLF2Yyud6J6b3llXVaQZJWBZPkL3jakUhHZZAALzk6itJ5U156REHiP9A5VM0gLoeUUMvx8be6dDyk07mg6WR1e3RwnFSvG5EKj/fecdsnl8+vb1RSarfmdtnRcBxmG1ZutStb3tV/+//+9eoO7VRFmXM081pPYb47fdPrqQQ9qtJY3BoOurJul5Ma++1ibXGHevRvn67rKT1IaZGZUq1Io4JmamRE4AhhSHHBt1tRvtnOlEz12t3Tc//HXw2NDl9arl31U/f//Q+tNy65W3o8tPfyk4+3j/cO9Dd2fveZmfdO9webu6Olbq2keOXqxcvndx/Yo+ENXQIcc7xvhMX3qiUbPJaaJLVpXw01qhiNVkhAY0YQXFMHqXm3o10iPzAE1f7jAWtDcaSslNBeYteZmRnUD6QlxdfX1Xf9wmVNIhWBJzGDnOWYodKV/tJ3vg23Xl+i3Lvpbm0q5Yq3vhTXNk8cmqisKpfOL+iE8hZuPCQ6uTRTm9w/cPej9zm4ewJ2KyVxl04dMYKcUVbka6kMOd4on3LHhsy/+uuvdfV1b1SCQve2H/zbix+fvdaOVibH8p+57/7tU3tVu++ff/Tiex9dcHzVIVrzQ1CGUPHG5eu5dG54ZAJwZLSzs7MrKyskl6l/iE2hGNh1chBviX0n6tvxYDwVEaHRhAI8SpYxOURkgDnvAPKEBNRPdMNrOW3TnNq2s7a2Ga9smjHuGInFUUqp2J461fXgXz+dmSz4yNTzh01rOpU9VLDvGun52ondO4rKb79/QQ1GfT1VJYjX2vjIJce7WldOfv3heNjajNw6IK1I7EbtzdfiXFcutojQyPU0hoqlrz6+d3osM78+F5tDv3jp0qdXyo4yMNS7ceLY4La+nqza//xvT795er0W9XhqoekpTY8aqRa4fm1ls7ZR3bX/CHEF5QPMB4gDhn0cJgmoJLUKm+GQgixygFOIkxCtATPES/AuiXl+Ji4WyxfxJBVzRenq7913YD/Ky5tUfqyu/Oj4yLkPPyFoIzlGqgu+TXijdBW/9BffOXJsu7Op2OXMsN+3XS9sV9N78undxeL6pfJ3/+9XZ25sWFYXJQnIp5SJDd1VrctrJaeo3Pe1J/XeLt8yxR3oFgk0jdOrDSsT5HJu2ix/6+m7H7x371J1Kdc9/uGpzTf+cG3LcUIr/Nz9O+85vH1iYOq9j679z+c/mCllJvffn+ubRok6DpDsqq2aVy9eKfb2K9kCxCeKg67erl17d9GUwRiQi0JQnEQgEi7rBgKiLCvFCKmlk3YREZFAFWREhAhIfgPX1KBF4Va5rFuUiR3kTmZgdMdYI3DKi4sFq0iAaaXSbTXjBPro+J7xwalXfjB/8fRcsFFXHBKaaSkLRVS0KRZ5Ds6okFPz7ZxtxfWmUYA1x4qVdaL44/nm7SePHJ0pffCLFwupPMw0jhENqVk3nXfS+toXP3v7fXdv3ygvKGb/mYv1X754sexYmV73wO19J/bZA2nz3MXZv3/25fXWYO/k3See+PPv//2zvtfOt/V6y8MRUjlcWVpdWV0fnpyqrJ8GhiHQpOur9TphmbTLSXpU6lQyc0RjUvwlAhLHlWCQMA+Kf9TppHyMn+fbdBYQaIgM1fbG6gqVb8IlXu3ctePypQsk7snvWXY2iGn6k5St09bmFltexRhJb9vZc3hn/7G+1HRa6Vf1XkXvC9s9hb6pbG+hd6i7Xiv79WYajPFiHRUM44obLTWV27/wsLlziBjHbwfpgkW1nVSKqZXvPD721FMnlsvzvmqubao/ef69Et5QC/ce6LnnbqoLQ7MzG8888+LCpl23pyaOfUbJD5DWFLMg+y85XEkSEA3M3Ly5fXobhSqEQHixubnJEyqubstRpTCP9YDC4solRJWCqKgQ+QaRkYgqOeS8fEDt0fehzuLsXUrHHlgVxEFPf09Bt1duzgF16BqRhCPJLeinFmhBbBstcE9Pb0J8i13W2FBqYii3o6+wY7C4Y9Tuyw+ODcaRY2hhROFms5WPLI0YOvRR3fVqy+tX7vjzz1s52KKn22EqFRZt964jE3/57c+1/M1mrG+10v/yr68vLLc80zt0x9hnH9i5uy8qbRX/4e9evnJNaSnTex76atA7TqkD8k2hJw4k5O5QX4KVzeWlYtqiYRCtIYphXlTKmDh8pe26JIBBaFSDd5CRRDhio0nsjoCQCyqU0CNJNLMAgDyluEIud2DfgeGBQYJdPMvAyBDwrJClIKI0LUJ5iFaG+MdrRVpEvjANMw49q5BvKmEtbCppxbGcmlrXu8wgrVa8hk6ZyiD/4rc2HaWhZGNTcQPS/BXHOb+yvv2e/QcO707lMfdGb1e4b0/33/zNF/NFfbNWC9We537y5pX5tdiMxyYzd94xNd3fp4fB3333jatzZkvdNrL3gXZ6uOTQlCexJLEQbRWhB5iYpDKYW1Qpe9X66NgYM2f8I0PDR287XMh3QfTIACMYKemJyvDdhKYmPYRUWRKDAqzbSgqWkAgCO4RSgWe1Su3qRUora1yGL/YMDK6trCFnyAMO0qK3hcxKqwHIqLFHmdaUpk1i4CaRXEZ3dL+iGK6RjptRTc2oLtVZnYiRGnZBDzJOOdZdC2shvGkbZt0Plyr+rv2T+VzbVDYmh5XvfOchK12f2VpRMsM/+fFHV6/VPDPontDuPzm6ZzyXaXf99rlPPjoTbfrjuR33dG8/Thk1ctuMwKFBk/COqhrhi6R1eAhhuZvzC73Dw8AIaZ3NtfUzp0+TzOFTsRtCdGYIBOm6FI6TFCuWlGBQR4UEkCQk4dxiwrw0DaQLilPeEtiG6fd0tyq1NtF64uiInEkmS1VRqjXJoERBEy0F1hTS7BFNytAAis9O2Jo8OGb2oKmxFql+K6ptNFuALdEFsNxq5g1t/fqNd9/+VRSuDg23//pvHu8d0hY35+3syK9f+vSj0wutoN0/lvnMI4d2jncPWF0/e+7t116aW2oWB3fc1zd1vI7Em+Ax8YpKrk7yGZKQZs0xDoqTcUips9LMdhexBhBHeqaJYMSlpjrqAwZhV0mPJhqEKMSREQaK/JiWQBCOStLZRNKwJcICAhMwXuJV6npaVze95c2tEokiLJscjbBQqagrBDOBZoaEVFoqJstDZUI1Q9UOyZUFGTOwyItptja6X9lzoi9Sq3QGUNZgMTaWt8JmrAbtoqqlNzYu/fLnjdKF7kL9a392cmBSX9haNNN97/9h+e03ZwMjY3dbh44O793ZPdU18uoLH/3qhaur5dHs1OHc6D7N6PbqcHzWVlNpalNSQZuiKTGo1JgBWgnoQqVZazhknopdTAe2wQBQK7wEioODxz/wjuQMOwkzUaI/apAsPM8lfgaMJWDlIzo1d+7eNTw6Zqbp8QkyhRyhbthoojgiUfiAODYgj8qAPKBF6BI1ClEekXNSqKeCw8X9OGNLyXtwSJnYPughFb4a6rGjVBfXettWrta4+urLyuyV3mL1s589dPedBy8vXFfM7vOXtl5+8ZTvpfWMdvjOnXcf3TVdGLp4ZuUnP/54ZTOv5w5O7D3ua/ly1Q09xYD7eFyO1bewMK7AzNEXFBbjoIaB56FBhy5OpkO/5eDo6Pbdu3P5ImJhPCiWKBE5zASkmaKkMTo2JkaC/zc0pCiTFlzSKrVadWaG78lbpsVV+JcSNWXjgJYxviHhDVk/SWrj1XQaLsmXqGznoH4Mm8LNoo1SXVbRMCKeTeXqta1dO3qra26NNr5Qy+kprVxq31jcWjkdXr80rrQ+9/ntTz118uLWJat7dGVB/Zdn3orjYVX3Dh4bPXJsZNdA/9yN1f/vH9+Y2+xVc3vHd91ba0tpk30T4IXlxLbL0igEGYmJIx4pWiRoi5lQk6HfBJsXzXGjeHFtjacmHZzJ1zAGWWKoI7MS44LhCFFEFuQUpC8RoIIs8T1BHDl5m+q9kkqDPgpFJfIY1CIh5vID+VR6HkRdxDnqAWluKVAwDMpPlJKTaikn5DKAM/1iUTZULr/3oXXgtruPjvy+subV3JQa5I147qM3gq0zfenVh+7Z+8iTI0u1G4qamrle/dWPPyFMVgzn6IndJ+4anxrO1dbdf/gfLyytdzfVkd17TmiFkWbZo7dfIRsiO1YUndWBG1KJRDAQIUaKUqPRUjiJXacOwYDjYXkx5TDbaBM8iaKBLVIvI26SQAxqKzxIpimFFw4e+IATkT4Xc8FgIpQm1TM2XujvLYyPSv+YZbccr6YQI0ghxkKrAJuAKLid8EvRIP6ssE2PPl1m4CJSgtfjcUEpKltZFqRefvf5nxZIfY5nFGPdVLec0uWgcq7Lmj+0O/jOnx+sqq2aF8S1/KvPn7pxsxbZVt926+id/bv6rEKg/tM/vHjuatwIBqf33ZsfmqhEoYZCt9SoGbY9YYCsn+r5aRBCllnwEd1idjJ3cbyOg/sHlSnDTo5n+npzIyPEPQiCKROdSSBhJoEXriYJtgQqRUSIjXhVWhISnUSDfDzu/oe+8mX0L5eyvvuP30N5MDcCPACIDCDsTlYJvDKIurm66HYnPUoSgE8E0JIUD6pF2GGAQ16cN/Xy5Qsfvvn27U/eu7lheStrK9fODmdakyOp//VvH9WUtcXyWldq9Jc/fG11tpRK9XUNdN35wPjoRL4/a/3T//jXU6fWYm3n6MTBkYldS9UmWqtTjAZlJAem076FreFVSWsJ/MiYJDoXd8AU8Z8qmEBHSjs30P83f/Mfy3Tj+sH7v3rp1B/e5QuMWSxCviq6IiaGLZI7BiQoEgHyBtWsUFSDnylaOHPl3I/+nznTTjVCr9py+yemMXIiJFkNUkWaxfxpjyEUFPVWfVybEbiqH7sUS8MgFbQszW8YRcmGhLGkHJtapm4qjnnthRcOj3edLDZe/e3PdxgLwwMz/+k//4d6v/fR6uJO7+Hnf/36H0633HwuO1l54LFthwrhAav3H//rm+/8oWe9Nnbs3qdT+R3V9XbGL/guCauaWAcr5Ko5u0tioMAO2xkCKgtWD+CIcxNYIK7mH9PxCpq2tLT0vf/yX9CO2AtaTo2mGMCSEIN6SoqWo8iwQVPS5ASt8ss/Ig7POweaQvabrOtadQ0MUVJkTPQkXkWwOCfcHV6M5UHckvRL/hVtYjFFT8UfkGpIvCa5KPkXdScKwtTQYjyB9sqvflbs4lxb2YL/zW9/pauneH1lpa848rsfvf/ex+faRqa3J3X86I4942NT2eILL/z+rbc+Ltf6h0cOHD1y1/krZa4EWWb0QkBkIJg9+Cqd5lJ+4FIoMVwIPkOxD3MhHJXMOrGTSdsFufEtwtlWi+STQVeqcMVbh4DrvzukcChHEseKjslccU/SHYMQisU8s3JJmQBKkr0nSMEjhrL7R4QjDoFDzkApi6RBEKq+NHcjoxjUE6Orq5EZ66TIQFKa0oBQj77u6tJGXG9NT/hPffHosWPbLq5eyFnDn7x35VevrYV6Ss1q95zcd8/+wrau4sWPl3/+8w/KVdo5utLWsKH2bG4u0MhOxEtEK7wNOcgiwd64uqICf2LvMicJHJh88hKGA5zj7JkIkTL+28zn0WsnIC6SoIyJgAodIciMOqLofNB53Xns+DUuAAGldZTOW1kK0A/oJcttpBCZ/JirIgQZiOSOhWQR2gcRxoWA+BPKAOZ7LQo6uo/3FxcAduJjTM0rZuJ8qv7EFw489JndV1c+ZRgXz8z96qd/8K2MmrGP37Vzz/ae0Vz3/JmF5559uVYupLPbmm5WOEaIg8FttUF9iWrw6LgwdgzySGLBC4iS4PdQRM6JHolvkqYcllFKECRSfXLjiDOMaL+mVQEVQ82YdUc6TIh5daTDo/ifzgv+4TNolcyc59CqwKcphF7n2HfhWeyKYXoUoZVaHTEDZwxFuLccRDs6IkB9qMnTwy1WBlMXrpUUUmJK9BSD0nZAnBMaukewtmNn/4mT29X25mhv9+kLq6++dDEOB0kYTW/ru/No/56JnmDD+O5//11pPaOG/fc/+hfvfnKz7jB6ibCaZSdLgUMaelkuVgVxMMVQ8SPND2jLQBMwL0aGiHjEkoRw8A8CopQKHgRupRLTQIcpCoAz5c630XucuOgl69+hUB0bEQFhSzSbB9JGLTiisJGITjrZeEEnr+ex5wAaKlYG5eR6CQnitGKU4lHbIDTJDArVokEsLwoVWzBp6cYkykZ8MQ0vxLQkCZ3Dh7fRRP36W++Eka0qmWzK1iN3+97UI48c3DM16GzW/uH//dnKfKpZGZkaecC0Jw4eOpnOdvmtONM2cxT4SCiziTCIJK+EhnoxTzQv5H2wmZUWDcJuSHmyTBRsqCnZ2TS5BNfjI4CJjEejXhVxoAUommzHY3WlJiZvJocAOVAi8hNUA1vBPowU8Yng4QhE7G7kichUtdWsZwpFeiEo1iY/B+sTeQsuwtDaDJcNDaAACkwVH5JGLpsh6lqLfkwtbOjtFiGwrTdzZmv39PDyavPlNy6dnXWffvobX/tS8eP3Pum7y945oWU9/YfP/O7c+WZb292VP6a36UneHN81fWDP4bBBcqRBlzTpTboGqJhKlCzzSTDIoyATURuVZWNujArlwG3zBVVn62iANXiE/PQv0B6QZflv2ZTUJ7DF5E8aKOAugvy3svm86HzvlifC0MCWMKB+NDE+ms+SPGUA4dbaWiqdlR0ICamQZfjjQbwDmYYmEYZgnFSgBCkRE1GJj5911dARdICxEymZQV+Pvm168NSZmbpT+PDjhf/+37432J/9s6cfum17f382/dN//d3p9zaAnnx23+DAsTDoqW1EC9dWp0emzbZJ1GKHuCzImqcFrEqyMGGiR1IsolOGlKkkvUQvmIi4NSSo0Ty3uboGnuKE8pnsBDS4UOA7YgAgK9DDc3lM5CsPyAgrTRwWOkmGDV7Aazl70ry3trZ2+fJlNpXQjY2x08s3NDwqVi2pAJqdRBsT2TEmon4GSlMIxoWSJzuwoLJtlssxiVv9NpX7Nm0QbKOwAJoey4zPnplpNfK+m9/aCl789W8yKX1bfttvf/zmm6/OuK2xVLitaE6QXKElQ3MyreVg/uIc9cbQib2Gzzn9ZpXTYshkVFmYmA49cNoJIXQc7O5gk7HMn22XSUK5u7d/ZWEBVSNyc1tNdr3Vq9UOzuDs8EL8SbsPyo76CWiz8bWjBjwXIxTpCINAIWl2abXYkWqRSPVaLAK7BCqbJSpNvX2DW4uzbNfPGmkRrlTQoMyou6CkpHaxMmkfQ/qSW6IWJSEMPWaU7smKhH46b23bPRgopbZSU+LayEDx9qN7Hrx7H23lr7/wwe9fvBo0piNnrGjsKC+4VqFim4W0TjIsWLq2smZsuI2AUN1veoTNkGfh9ugHS0SNwofl0l4NWlIZgXOREzID2rZ0rau3x/FabKUjOYg1+AG1dSk909PD2mNN6AT7E/hA9lcA0JBHieaFQmFfMK8A0OJjgidESIBKkzSw5HlRd3cXX2q4kd9ylpcWxsfHt+ZmJU8niiYOE0lQr4GVC1dFFugRaSvMMA70OCcBYFrVqQm6TtqSvAN9DGM7B/RM6ckv7Zidyx05dkchN/juHy69/+6Zmx+2tzagyH0Tg0fCsubVXS0o5XsMsINoWXbq4q+oBNNP2wpo4gdBORCQpBck1WxpLmbOyCSvI/yDRUJ8UTg6PMTgEQ29WPlCJtVVLG+WyQiSOKXZI4GUKHA83yFzQkAlRBdPjdcDwrBRMT/gHQFhNYLZbDp0pbzf18fO+C5KkexJwN2xq+Luu+82CkWqliA6GoEuYmySQqPmjpWJjJJmaVaZN5E1YzSpruiMLKbPVGsPDvVvn5r0vPmd28Z2btt1+tMrP/7hs/U6V3GMrb1jfXuLuTvW532LSn3c9LeqgWprVoZVJLXCKMjksYSGlOSgYGLmQutxWfTPeOwWBA3ZeyMrQZKIeRFRGbbV29398ccfQmVl5mq7WCygNRsbW+gaTabiuUg3s5WUPm5uOyAuXg5uhoB6JavAHnTqtVgyCIPUPdIINAeq66trbFp02FOZydFf4FfKtVJ5emr7tbPnCdfJgglm0c4qLFHcPKoDVWEysDWUlGiM9r1EdlrK0PEa7B0cG95ftPtW1jYvz5Ref/3NK5c3K+vZ2LVNL+/UsxP7Dg4XDwUrM1Vn06ZEFVpuqZrpg2CBYexNZna2ZIURls/cJEonpSFcDM4FHXWpJrEYbGSVOXeqE5M7pgCdVrVCg51O/0WlUq9UkmhUIhBgG4nzE1BYVKQjneRRQg2MLdEgVgYPDxFIvH7SOiQWlOQQmCwbtdAV1mXu5syhw7dfN64KixUTY5MA3j2EgyjoNkNHiVgl1FCyii1q7HKfBSdU3chCmJ4+e23jX/7ppYuXP7l4Y6vZSClhv+rlwybawN4w44O3Pnz6yTvHhwacRhlzAmHo7mxUtvQUk2Pja5u2JZ99VyEpOAh1CgERWovWgxXs/5B8EDQNVkvaDJ9HoKOMDoxcuXlOgepgY+hV5NHQTmQvm/lwcGZKDBW7lRbGQBCGc8n40SBeYLq8gDCTiePryYFgeYnzknWJg7HxUW4DwjYeqs2V9bV6pTY2MlZZWEZw1LJ5BJhx6nyVFeusgGTOMFaVTZfNvNaluhQ6w7RrGV7+9IerF89UILdNr6B46RBPQh5LU0GETNQs1apvv/3zh+7/cqXUt7lVC3RKsHCoQKFdlrYLF9VwiBdo8RHbhjaTFYJcc2kEA0LwNRqWsWQcu5DZ9vjoODup1xYXmTXvT23fHvrN+YVZXDt9Zp5DpTIJblG4hAohKaYgkgH/hcckaoLAhN1hFh2unbBE+QG9kNSzg4BdZ1JCIhMSRnNzc5MT0xLFYN/YO+di9QlKwC9sNskFMTJElZB4KerSgkaeKqj7QVNlL26lKn/1qtGoxOzRi/DdDSnkxo5TTNnXr51ZWrh+aP8B28iQAKWaxifULyNsCormEY6yBy1yXdqPhDTLmG/NCrRmUYQZdoJKpjA5PsXgFYJ4icEjOlWYCAwIHEAJKC7Cg7g0C82nHRUR9UnkAtlFTj6UQg1TClvyYLluTEN0SWWXLPu3SSWaLd9prdKLwSgNJZft6hsoLa8FOw4MbD9y9dKVbCrxsIGScqOCq8UOJzd8qmSYAu4mcGm6U12opuFWVNtPK1WPzazckgGFkwBFTGULmZqhobB/y5xTiMe87g/f+93I5ycOTU+cO0OZK+MGFtuVKIESccJBxaJ8tDartSvAdLqd19k5qbCb0E8ZQFVJB7BI4av5kenhpuoub630Tx7YWN+M28uIbn2jhnipSrFLP4Drt23ObrTYdoXbBoZxJi3JRgs+J4cAUaJgkmlHHTiSui0SpfAsbdT4UMue2rb9L/7qO4898qhqmac+/WhkeJAt7ygXkR+cWhZTFFAGD+6zwkk0TY47Ye4SUianJw7BXMTayWURTgkMYMXwC3kEBJmBFpUrq39499XBocLkxCAYTPMyjBRlodlcMBVHw150yfupKd0GXEFPwh3UgU0aFPLYcMPg01Z6YgIRn+H7Dzx477f//BsTO7fTMIbt0PPNpHBcYgdJzM33UZpE9VjjBJplIn+MNvhAduclOiYKlrRHc3l2C8svwxBi/vgXPjd7feaF538OZAROY2Xx5oE9O9N08hKa4vuIG/HEIDmJXRV4Y5OXZyqBqYR4UQmJxBtQV9JBSZAdiSFPMUoOsXi8g88/UBHDQk7la9c/mFs8t2vXaMpiYxQJAY2gll5Xk447biRFQaHlKLJdiGK8mmXjDEsTqvlcF7bI9Ukq7t29Z2V5UfLzcfCLn/1gYeHaI595eHJygksG/ByjYL8/ZoJSJPohC4Cgxb5YZfFdiRcDhxOLE/OTtUyUCMIbe1BOsqq03NOYsLq2/PxPf7a8sKams0k4k5q9dimz22DrIndFIG8AytDERwqKOxpJ1geXTGumQeFUMt9CsiGPbDpAtxKQkvVKRgGBYTiCpwhRNVjVgJiWfZpB8/33f9f7md4d28YuX5gljCNlKvvfKXOzcmSX8aAgXsj9BDJew6W/lxVl/BI9RDH5gWajNnPtqmq6eEIqq2/89hdnxvrr5Qpu1aTmGsneHNZVUTIMQGacyAnxiddKxNTZioC85OjgE1ouK4qa49KpBSFahK3aTtRwqg0j1YW85TYKsFg/vnn1Ugp/2SZlw04uSnQIBv4BVWHTB3kRaUDHvWiAAwEuNTL5SEYvLl0YN432uF4sVHgN8gGR0VnPb0BXsJfN0tw77772+Ge+UVrF0bM3lvRCzo9BGUlmcha3Lbu2qdSQLWQyQLlU/WBAKIPnzd68GvgNWt4ltya3hzBLK0twbLAaOsgmaJt9CNKHyJohbNEPpo/iiIB4C/1ALsky8lKCDU6LO5CPwXZaQumxZ5pkwsUIGEqG+tbY8Ah+bX520UDwYcCoC+keqo7cqMJkr5DJvQJQPfZoiHm3QxvdMAjC5AJiwFxXiC8rIFwexoJQk6xAYu+YPEuCItAjo7Zl7+js/LnrN/fs2LHvZkyfUgmSldJyDB02HbJrzEhJjwtKxFpG/sT4GOC1sjYLQ424z0erlU6J8x8Y7MbBs1ULp8vySG1ZTBpCRLyUYraMRwg0MoBwAPtIIBnULZBGKTA+zJJv8R3Gx8y5MP3EjAOshVQxC9mNQ6jTdnDDbaqDyCCMc9lut9VGyciCsx2OLamW3mtqvWzkUuNu3UZmVjYH4YBScRViASkfYQryBy9OlJdhJpVeSZYiQ9gtS4KeBu2GYlbf++RFxSwPj+fHJwZzRdrosqaRYb9Q2iIBVlBD6vZ5YGJ4tGd0svv0+feidk3RmrFSz2fBuJrvVVZWZirVDVrRRU9D2THL4jEIMSTRu4TxCl0ISHWJm0LBk3yQRPN8g0VjEZJkmtxnKJkAKR1PQCFZ0sRPyc3wMOXFxVmUCpEh0ZSRrtUrWXNIpZMlE/QOmFpfpq1kZTsxikCeRalL0dG0g6iW7kKXJIPLOECoxLgkUBYl5g+TBBYpUouxs+VcMsX4CH5Yqoc//uX37rnzszv23+bU4ZMJVqoe4TiZL75GkiWbsxtO5c13X7g6cyrU67TgsNGAzR+SjmUrZxjQyiPMUaibLAozRkC8ZrbUQ0RO4oIlF4tCiHlJGlbsQqRDvgDtgkpDPwlGBLNFcPIvWEj8S8oCbyxZXoCd5uWA0pExMjS2uVYDi2K9WnFvnrvxkqF0W7AefhuHmCGgRh4GjyfbolPGzVJ1ZesG9LejRJyNy0rALKqElPjjp26SeyB7AgYT3bYs6mq6vtWcff3d50eGzg/1jgM3gvNkWBxS9znWlij+0uza3NLNrcZKpG5SrRYG77rpTK5/aHB1dblBD5XwOH5WJWhg/2kQeZKkIfIEPUhKspYSmkhEhkAwN3KpCEwGJz+A50vmD1KHyxbjSvQI/yfAeUsPZanZ3WYlt10wsoXs+tY6y8ANFRvuFlWLP3w8H7ODxcihD2zjabrNlJGhkUPoogRJTCPJ1mgugb/nsakR9BHRiPtiVZPEC14eIcVSTSDHh+whGXiaMGXna8Fqba58ZfYjDEDIL6sexTm1h65jT6mzCdaLXc3CMTUCn1K0Q76DGJv9t2wybTYdqIqpEHMl6yDX4/dcHauQ9gv6pnDwaAQ3BwFwkBdiYmyAk+gW+oLQXKeJR6cZmu5EPoOaJdlqzih1dmxNRhT4hp0hY8K99zQ1jS2TrSwWio1GKZstsh7c7obqCv3UqbxFs0DbbpDAE7wRmGMjBwPk/nBVw+LCSTWcC3GFzgMGTawpmQu54ye5NqHvwhBxOk0MAgKIc2Po+D/qCJS5Ss2VLDfyYM1N7hdTwQgMur0itiZ3lSslhAs7dj20xpGbDgRbshOEME0MGhAWW+OsCED2CiZ3vKC/k/NjA0QvfENsTwwJVWMdHJcCRq3eoDOIX8LpeJTzEMRLjZAvYq3EZegCCulKGqXd7urpxnsRX9ecNdvK0vnrx2F3vrfQndtadyqNJqsBX8AoSNVAhGkQJX8Lasg9/vi9HFxE9mpwBXacyvykBiCxIuEvMiNjxTqgcMiFJZRvIj64QNweKAx2d+fh5AvLc1SQ8VEtjxvv0IHao+ndG6UNRCfclKZCmhyoA1GOgmmIgEAj0RG5PDFKmtsdOMA+GgQWJ5xM3KuoKQLFtTNkt9lI53sR02B3v26n2d4nMIbGi8RFQJyM/e4USCnhkvggBSnzUQJuYoJXBllg/Iaexrw3KyQyGwMj/QUvXy6XK9UtkIKSmJi3tJDTFyeJf0SBQ6ODPRmnrIcaAWH4YZJz5HokXmEXsTiVkO2TcAXJO7GDwFDMQr6/q9ibzvhra8vlagkyG4REgNTYJbG3VdrM5TLoLfQEGAVB/MBjQxKSR+KSVOdLoraJk2DDbirFIDP5jOPKfl2+L3nETjTP7HnG4NgaLfW35Hkffelyij/pUcIK4HZBiH+FLcDwIXhMY3NrueU0oaHcJqa7r+B4Ve6ThZOq1UvnL50hhz08NLBz504qCvBLdl8aRhZZsXOEsIQWAP7QCDQI4Qg/FVExts5H7L/EoKB1Iju5Larcu1Xt6e7j1j0jI0M4xGuz11ara57ikGFER3r6C0gfCTRd9oqQfuZ34rBkQ5GZEt2X88vZ5L/O0VZ7epismBs5wkajLs4ewSYHW2+7GRdWDv5S1BoemWC23FvBttSN1VVRfkSWZMBu/UBhox4npzpKNlX4tBBmbLAdkSFqNkkBsJJaf9/QI595hIpIvVFt1mqptE0PC0JnF4fTgjoTKGG2YDDaS4hGPEOOlPXkdHgyrB6LFITmVpbkvLilMI/ATHd+YPv2Pf39vZXKxvzipUp1kd1HX/jcE2TPtrYWuSEE0NbTXeAWOkxIKAxGyy/FS+AK6bcUHgThSiBPllw0Sbe279qjatytT8kX83PzNxynliRyGElyEiIicJBX3JGCc8LcaeTgDg1Evcg+kaWABFcSKxPfw2YlMwgdgmaicW7Uw2e8v7y8CnfhmW2mH//Ck81psN4AAAvHSURBVGfPfQKU0MzV9Otzc87S3FI6WxgeHp+Y2NZqNUrltTDiJpbkh1z4FBdKFjWBZzSIUAkwo2fL5g5A0J10b88QAMcddZYWVxv1DZxBW2li3YrSV6pU77n3xOzC1dgvlTfqNZuNrZJOZErcl8BSoWABG4mIE1BSsSxRUSAJJWGwYLTOLScqVbYvEw7LlniZKasE7OLh2PzOI2tumemm7Hvb6snl1lZW2lluKTkBAYU+g4g4ORIO/DJqNxETNVR2nyI8EJNBcPskKcAGdTwFynXniTvZpnrh8vsKWzaUBnRcnKthV5vL1evXU3Su9g11d3WbBmEdS8pdsIi3YZXS+gSGC/GTLm2QXTApxQb72NvaXJrZWm34NbCPUjE6KzlQMYTamdPvTk09fvKuO99553VCuYjqWKIcEhlKuRegxHIl4uqsMayK2+cl6S1UyRgYmsQXN1ub470Ft1l2G9Vc1sIByI1CgKv84BT+jLsrESjEbbur2HfffQ+e+vgTYs3h4YG3Xv8tig9FEXlS9GPAyV18hYTCDKA2IiM4hBQRxYzxcoY1Pj4J3JDT1LjbUU4oVZ0Cv5wIzWVzpW+qaSJCS02bBA2gEh36FptiCKmkDwWGKXSNGgsd+V5LwvC2Q5yCE8ABQWepZpGltiEjtl2qcN1wcnIalJidnYmhPywadi+xFR8Bt+JmhJQKvOIVSOtzx1A0g38hnMbxu+6pVmqQriNHbnvjzVfL5Q3uMsF2XRQckbK7jWXkt/xeIjiKqLlstqe7m11nOPuu7u7NtVXWFrjBF4jKiKsUQCP2k5URPe2Q0ZjWGGwKoVPC3yqvs3rYJXpI1UmCm3bY3dMHwCFaggw+ZVWJVFt0r3ns2SzXmmuYmxdzm+P5RmO95Wx4fhmVSjgRoQmNHZB4EIC2VGIgbuJs5fMFShXttletbrUaRBJyT2gBR+LEhHkhF24UIwDAEvN70TgEJkzK0DP47kOHjqOHJGR37dpe2tq4eeMKeUkUR3ybBBhCZ7BFkiU+O9glW2PE585/ksnalI2uXbve1zs0Mr4Dt4dC4hvABUlQkNZihzb3BGLE6LTkGzkXEEvNmhVmC5uLsMAp3gHXQBxUDHbf1U33G9RVGnVYfdhKEHCTu869nEU99+yd3rt3Gu6BbSYOCPBtYb+yq0Zgk8xkRP0PUkMwSOEXAkFalRARHgZlF+WSrTJUo3F7jJkWEDE2lo3FEKVPpJMApmSdRsZ25HLFpYVlVAHPe+bsx0yf5WOrhNwSRpwp7AxVQKrAHT0PCv1Z3LiheeHimW3btjG3S5eubpveOTS07Za7FTRnNyfZOpSJzdDkccQDyg30hEtRysMCmUpy51I2vSpao15GBCRlMtxYbGszKcF5bIYY7OunIIMJpM1UD814opTxYN9gb6Efgq0p9mDPUNYuYLY0nRbZCEevL4Se/Cx7PaSEjby40yu3qpSkBz/mTxwJKQBJrTMoKBujY3GZF96Wmw/BNiWjKWUcxeztHT1w4LbLl65y18q9e3ZfvHSWZpgwciB0xBSsp2AigZSVLspzvCs/FE4tMW2tWscTjY9PrCyvrK6ucTspfDm3CpVeF/goSyHmRRyFRqO2PMqqSBCADcpQoVKygCJ9iZrw5cyLsjEJfYEv/BOZlHqjznfo8Uql7HqzBpkYHxul/2R+YYY14z7nTM7xHIyF26rSzSUEW2nXk/YtEt3gNFkCGa5EcWAwQ2IU/AM4CotJRsXAIBQoArYCMIJKuBGN7BJVmVOnz1HVOHDwALhzY+YKBkSYwhIySLEL2rvp0CBkQkBcRk4PWaApgrufGdbm5tbAwHC+kK+UKUNWpyenikWaAwlqsHPOgSWTXJVUnpCXxM4ROR9BAhgcgCUOhZwG2s5k5E63AY/ktEAFEp3c8QkdxOvi4shvQxpQFSttNJ16ubSJrtA87PogNBYNEfCkoQCJc/tntqnpForAdZEYlBcfkRgR1iErh/URGAsxgVwLnvC5lTTBqJaR0fTc9u27+waGr9+cqdWru3bv5L4z585/SmqPiATXyeA50DRmyFtqcWAKeSNIAWpu5OsFmXShViWAIpNq7993m2Wlz54+w6Z1bv0DOVpYusrNH1sOi89QiGYhASTA5I4pQCNLykLhKxAWp5VHQXF0UzJI5BDkeXLIXXW5zTHtKUJPBN9YH74mtgJP6WyEkwSA6CvviLil1RB2xD2AuCLf5G1UTXLvyIU17nxTAJEWZT6TRAyrlaAyBWwzPTQ0NDI6DdO5OTuHDkPHOfdp4Wu4EW6MYzWasCgJFEUaJK2JWrldsiyGDAtqw2UQm/xhKQjLMjPT0zt6uwaWllbLpWpfH/c3YdueXWvWluYXqvUSqwP8sP7JrJl85y95JVMDmlgTQTmmk7wr00n+k8c/viWzTQ40nDdvvc0JxI47H8gokcefPkJz5bngphh155BzJgfvsGQYIF9od3f1joyMUSlkdqXaJo0YhUJu27bpcmXj+vWrXsitlZg6v8OMmLn8yUmSRwQ0lAgIktYRkKhasjJCybnfNXtEJse2jwxPuk64trYhTdMm/bN5rsFJauTp6lUSSYwdYUhNE/eYDD1Ze9VS5GudQxYiOTBthn9rYglv4O3kumIyt74k/4jVSGwoyt4pVAn3482OJHjTV+A1cr1bj9I6yiJrkCnGD8AVCl0MuNlo1Wo1UmiUcXt7u3t6umfnMLJr2DWBYALB8GZOm9ippMk5pYxEzfYOCG7CnQRN4MoyFj5An3ki6USKQG47k+/FnQ0PjTeaIbBP0oRPubBlptIZO2VnmLKcE29PtJHoDiLgivAxnmBr4hfEEnnS2TIL6IlvEePqqEByacJ3ri6HSIo/RiM2yx8LADVNXvJK8uocshiJGQMboKv4GIFBKU7wZSRC8Cn3TzE1FhV5pdleVC5du36pzo1lk7gfBw//Yi5yzUTypBP+KCAxMTQIAWFiIiC+1LkwjWXc7Y75plN5buVLMkMzMzwfHBrnPp0EL/zE4WbY7J6h04IMLIkGoFluoyyyAHsTT9mhAGLPIi9AS56wZLI1hoCLN+FWWEOSnRGxiEBuHYl0EAHMCyxg/sKN5a7JkgaTpoGk0Ut8r0iOT5P0GGEdQpRUHDOn6xcGlaG1z1C53ebKyvLW5mqjUeM7fARdJgzklpjczjWJBG4JSDQ3sTgGomZ6xpAIT5JRydvi5pCZaJL8Jx5TYgQLRaP7Q6aniAIXi909vf3d3X20dZJCpECIX0vkAnEjrJbuNqkColvJwRJJmY3/W5LOaxGQOB1ewU86oCtXT9om5V+gmrH88SDwkKfs/00aMEhcIA8+VtkZnwioIx0epScGVytVbLYlcxdhbpK6Xq1VXFdShVJGBfIJ9zio4ZFppUGP1RZ9v7U2HQtgCLyPgCb5QaLMvEyORECSbxe3zUeJMPEHiXkmHh2p4buTxcYg5FbcUgtHIxJwwWrEppAOEvB5jyujPYnFCUuRJ3K7IQ5suvMpF5YnySW4ItftHEQlDEHmwqfwYdRIIA4TSz7gRm3C8pmLfJC8KzUJHDbcVACKEhMSwRtSvGKI/D+FhJStpIOR3eA0R9MSZaflNhAs35+0BktilAxSRpXu2S7mnXgfeEMyHBFKwvdIAMrg+IJIUOBdjbxkzZO1RRwACh9THUuSqlJVlskn6picgR8laZlEHLewmecIHTQWnyQfCAYmAhJqKS18twTERSTlh4T4j2nhs2WAnP5WIYFfUd7hnc5PxEt0vsbZErhFcHxHDDkZMHKR+wOzO9pKJ41QdCDQ40BB1KDOLnxFrsfY4BwEGKASaffuncBe0hQmuVcRlig5Y0DMsqqcnVMI5xLeTmIlK7NJDunj4qvikUiv8AVOLnNlvPJ+Anh2LFUgEbi8L8ooDIyQLfm0804iJcQvKyb9+snB847O80veQHIICEKIjCAjvMO7fCcyibk5ZOh8xLNb8k6kzq/kt4mEGSTXjZQKO5UF04R/CK3BZ2C6cotdUQLJAUH1JeKX/+Mv/f8HS7SRQmwp0w4AAAAASUVORK5CYII='

// Soft card layout: light grey page, white rounded cards, one accent color
// for primary actions, red only for destructive ones.
const ACCENT = '#2F7CF6'
const ACCENT_SOFT = '#E7F0FE'
const DANGER = '#E5484D'
const TEXT_PRIMARY = '#1C1C1E'
const TEXT_SECONDARY = '#8A8A8E'
const SURFACE = '#FFFFFF'
const SURFACE_MUTED = '#F0F1F4'
const PAGE_BG = '#F5F6F8'
const BORDER = '#ECECEF'

const pageStyle = { padding: '20px 16px 40px', background: PAGE_BG }

const heroStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '16px'
}

const heroTitleStyle = { fontSize: '24px', fontWeight: 'bold', color: TEXT_PRIMARY }
const heroTaglineStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  marginTop: '2px'
}

const cardStyle = {
  background: SURFACE,
  borderRadius: '14px',
  border: `1px solid ${BORDER}`,
  padding: '14px 16px',
  marginBottom: '16px'
}

const sectionHeaderStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '6px'
}

const sectionTitleStyle = { flex: 1, fontSize: '16px', fontWeight: 'bold', color: TEXT_PRIMARY }
const sectionCountStyle = { fontSize: '12px', color: TEXT_SECONDARY }

const rowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${BORDER}`
}

const rowTitleStyle = { fontSize: '15px', color: TEXT_PRIMARY }
const rowMetaStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }

const pillStyle = {
  display: 'inline-block',
  fontSize: '11px',
  color: ACCENT,
  background: ACCENT_SOFT,
  borderRadius: '10px',
  padding: '2px 8px',
  marginTop: '6px'
}

const noteActionsStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: '4px'
}

const actionLinkStyle = { fontSize: '13px', color: ACCENT, marginLeft: '16px' }
const dangerLinkStyle = { fontSize: '13px', color: DANGER, marginLeft: '16px' }

const STATUS_TONES = {
  idle: { dot: '#9A9AA0', bg: '#F0F1F4', fg: '#6B6B70' },
  ok: { dot: '#30A46C', bg: '#E6F6EC', fg: '#1F7A4D' },
  warn: { dot: '#F5A524', bg: '#FFF4DD', fg: '#9A6700' }
}

const statTileStyle = {
  flex: 1,
  background: PAGE_BG,
  borderRadius: '12px',
  padding: '10px 12px'
}

const statValueStyle = { fontSize: '22px', fontWeight: 'bold', color: TEXT_PRIMARY }
const statLabelStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }

const emptyStateStyle = {
  fontSize: '13px',
  color: TEXT_SECONDARY,
  textAlign: 'center',
  padding: '18px 0'
}

const primaryButtonStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#FFFFFF',
  background: ACCENT,
  borderRadius: '10px',
  padding: '10px 18px',
  textAlign: 'center'
}

const addButtonStyle = {
  fontSize: '14px',
  color: ACCENT,
  background: ACCENT_SOFT,
  borderRadius: '10px',
  padding: '10px 0',
  textAlign: 'center',
  marginTop: '12px'
}

const formLabelStyle = { fontSize: '12px', color: TEXT_SECONDARY, marginTop: '12px' }

const chipsStyle = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginTop: '8px' }

function folderChipStyle(active) {
  return {
    fontSize: '13px',
    padding: '6px 12px',
    marginRight: '8px',
    marginBottom: '8px',
    borderRadius: '16px',
    color: active ? '#FFFFFF' : TEXT_PRIMARY,
    background: active ? ACCENT : SURFACE_MUTED,
    fontWeight: active ? 'bold' : 'normal'
  }
}

function timeAgo(timestamp) {
  const diff = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

function truncate(text, max) {
  if (!text) return ''
  const flat = String(text).replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

function readJson(storage, key, fallback) {
  const raw = storage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

/**
 * The watch is read-only in MVP (SRS #42) and the long-term plan is for the
 * separate Notelet mobile app to own note/folder CRUD (once the Phase 0
 * BLE bridge exists — see README's "Phone <-> Watch Communication POC"
 * section). Until then, this Settings page IS the interim data source:
 * app-side/index.js's PULL_SYNC serves whatever is stored here via
 * settingsStorage (shared between Settings App and Side Service), seeded
 * from the original mock catalog so nothing regresses on first run.
 */
AppSettingsPage({
  state: {
    settingsStorage: null,
    folders: [],
    notes: [],
    deletedFolderIds: [],
    deletedNoteIds: [],
    newNoteFolderId: null
  },
  loadState(settingsStorage) {
    this.state.settingsStorage = settingsStorage
    const data = readJson(settingsStorage, NOTELET_DATA_KEY, SEED_DATA)
    // The form draft lives in the same blob as the data. this.state alone
    // doesn't survive the page rebuilding on every write, which is how the
    // chosen folder was getting lost and notes ended up with folderId null.
    const draft = data.draft || {}
    this.state.folders = data.folders || []
    this.state.notes = data.notes || []
    this.state.deletedFolderIds = data.deletedFolderIds || []
    this.state.deletedNoteIds = data.deletedNoteIds || []

    // undefined = never chosen -> default to the first folder; null = the
    // user explicitly picked Uncategorized; a deleted folder id -> reset.
    const chosen = draft.newNoteFolderId
    const exists = this.state.folders.some((f) => f.id === chosen)
    if (chosen === null) {
      this.state.newNoteFolderId = null
    } else if (exists) {
      this.state.newNoteFolderId = chosen
    } else {
      this.state.newNoteFolderId = this.state.folders.length > 0 ? this.state.folders[0].id : null
    }
  },
  // The one and only settingsStorage write for any CRUD action — see the
  // NOTELET_DATA_KEY comment above for why that matters here.
  persist() {
    this.state.settingsStorage.setItem(
      NOTELET_DATA_KEY,
      JSON.stringify({
        folders: this.state.folders,
        notes: this.state.notes,
        deletedFolderIds: this.state.deletedFolderIds,
        deletedNoteIds: this.state.deletedNoteIds,
        draft: {
          newNoteFolderId: this.state.newNoteFolderId
        }
      })
    )
  },
  // Called from the "+ Add folder" TextInput's onChange: the native input
  // modal opens on tap and fires this once on confirm, so adding is one tap.
  addFolder(rawName) {
    const name = (rawName || '').trim()
    if (!name) return
    const folder = { id: generateId('folder'), name, updatedAt: Date.now() }
    this.state.folders = [...this.state.folders, folder]
    // New notes most likely go into the folder just created.
    this.state.newNoteFolderId = folder.id
    this.persist()
  },
  // FR-MOB-003: deleting a folder moves its notes to Uncategorized rather
  // than deleting them.
  deleteFolder(folderId) {
    this.state.folders = this.state.folders.filter((f) => f.id !== folderId)
    this.state.notes = this.state.notes.map((note) =>
      note.folderId === folderId ? { ...note, folderId: null, updatedAt: Date.now() } : note
    )
    this.state.deletedFolderIds = [...this.state.deletedFolderIds, folderId]
    this.persist()
  },
  addNote(rawTitle) {
    const title = (rawTitle || '').trim()
    if (!title) return
    this.state.notes = [
      ...this.state.notes,
      {
        id: generateId('note'),
        folderId: this.state.newNoteFolderId,
        title,
        description: '',
        isPinned: false,
        updatedAt: Date.now()
      }
    ]
    this.persist()
  },
  updateNoteText(noteId, text) {
    this.state.notes = this.state.notes.map((note) =>
      note.id === noteId
        ? { ...note, description: (text || '').trim(), updatedAt: Date.now() }
        : note
    )
    this.persist()
  },
  deleteNote(noteId) {
    this.state.notes = this.state.notes.filter((n) => n.id !== noteId)
    this.state.deletedNoteIds = [...this.state.deletedNoteIds, noteId]
    this.persist()
  },
  togglePinned(noteId) {
    this.state.notes = this.state.notes.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
    )
    this.persist()
  },
  // Mutating this.state alone doesn't redraw the page here — only an actual
  // settingsStorage write does (that's why Delete/Pin/Add already worked:
  // they all call persist()). This picker's selection needs the same
  // trigger even though the data it's writing hasn't changed.
  selectNoteFolder(folderId) {
    this.state.newNoteFolderId = folderId
    this.persist()
  },
  folderName(folderId) {
    const folder = this.state.folders.find((f) => f.id === folderId)
    return folder ? folder.name : gettext('uncategorized')
  },
  requestSync() {
    // Settings App and the watch's Device App can't call each other
    // directly — writing here is what app-side/index.js's onSettingsChange
    // observes to push a FORCE_SYNC to the watch (see that file).
    this.state.settingsStorage.setItem(FORCE_SYNC_KEY, String(Date.now()))
  },

  noteCountIn(folderId) {
    return this.state.notes.filter((n) => n.folderId === folderId).length
  },

  renderHeader(title, count) {
    return View({ style: sectionHeaderStyle }, [
      View({ style: sectionTitleStyle }, [title]),
      View({ style: sectionCountStyle }, [String(count)])
    ])
  },

  renderFolderRow(folder, isLast) {
    const count = this.noteCountIn(folder.id)
    return View({ style: { ...rowStyle, borderBottom: isLast ? 'none' : rowStyle.borderBottom } }, [
      View({ style: { flex: 1 } }, [
        View({ style: rowTitleStyle }, [`📁 ${folder.name}`]),
        View({ style: rowMetaStyle }, [`${count} ${count === 1 ? 'note' : 'notes'}`])
      ]),
      Button({
        label: gettext('delete'),
        style: dangerLinkStyle,
        onClick: () => this.deleteFolder(folder.id)
      })
    ])
  },

  renderNoteRow(note, isLast) {
    const preview = truncate(note.description, 90)
    return View(
      {
        style: {
          ...rowStyle,
          alignItems: 'stretch',
          borderBottom: isLast ? 'none' : rowStyle.borderBottom
        }
      },
      [
        View({ style: { flex: 1 } }, [
          View({ style: { ...rowTitleStyle, fontWeight: 'bold' } }, [
            `${note.isPinned ? '📌 ' : ''}${note.title}`
          ]),
          TextInput({
            label: preview || gettext('addNoteText'),
            placeholder: gettext('newNoteDescription'),
            value: note.description || '',
            labelStyle: preview ? rowMetaStyle : { ...rowMetaStyle, color: ACCENT },
            onChange: (val) => this.updateNoteText(note.id, val)
          }),
          View({ style: pillStyle }, [this.folderName(note.folderId)]),
          View({ style: noteActionsStyle }, [
            Button({
              label: note.isPinned ? gettext('unpin') : gettext('pin'),
              style: actionLinkStyle,
              onClick: () => this.togglePinned(note.id)
            }),
            Button({
              label: gettext('delete'),
              style: dangerLinkStyle,
              onClick: () => this.deleteNote(note.id)
            })
          ])
        ])
      ]
    )
  },

  // Derives a single status from what both sides already report, so there
  // is no extra state to persist: watch counts + last sync time come from the
  // watch's REPORT_SYNC_STATUS, the pending request from FORCE_SYNC_KEY.
  getSyncView(syncStatus) {
    const requestedAt = Number(this.state.settingsStorage.getItem(FORCE_SYNC_KEY)) || 0
    const lastSyncedAt = (syncStatus && syncStatus.lastSyncedAt) || 0
    const { folders, notes } = this.state

    if (requestedAt > lastSyncedAt) {
      const stale = Date.now() - requestedAt > 2 * 60 * 1000
      return {
        tone: STATUS_TONES.warn,
        badge: stale ? 'No response' : 'Waiting for watch…',
        hint: stale
          ? 'The watch did not answer. Open Notelet on your watch and keep it on screen, then try again.'
          : 'Keep Notelet open on your watch. This updates automatically.',
        button: stale ? 'Try again' : 'Request sent · Resend'
      }
    }
    if (!lastSyncedAt) {
      return {
        tone: STATUS_TONES.idle,
        badge: 'Not synced yet',
        hint: 'Open Notelet on your watch, keep it on screen, then tap Sync now.',
        button: 'Sync now'
      }
    }
    const changed =
      (syncStatus.folderCount ?? 0) !== folders.length ||
      (syncStatus.noteCount ?? 0) !== notes.length ||
      notes.some((n) => (n.updatedAt || 0) > lastSyncedAt) ||
      folders.some((f) => (f.updatedAt || 0) > lastSyncedAt)
    if (changed) {
      return {
        tone: STATUS_TONES.warn,
        badge: 'Changes not on watch',
        hint: `Last synced ${timeAgo(lastSyncedAt)}. Sync to send your latest changes.`,
        button: 'Sync now'
      }
    }
    return {
      tone: STATUS_TONES.ok,
      badge: 'Up to date',
      hint: `Last synced ${timeAgo(lastSyncedAt)}.`,
      button: 'Sync again'
    }
  },

  renderSyncCard(syncStatus) {
    const view = this.getSyncView(syncStatus)
    const watchFolders = syncStatus ? (syncStatus.folderCount ?? 0) : 0
    const watchNotes = syncStatus ? (syncStatus.noteCount ?? 0) : 0

    return View({ style: cardStyle }, [
      View({ style: sectionHeaderStyle }, [
        View({ style: sectionTitleStyle }, [gettext('syncSectionTitle')]),
        View(
          {
            style: {
              fontSize: '12px',
              fontWeight: 'bold',
              color: view.tone.fg,
              background: view.tone.bg,
              borderRadius: '12px',
              padding: '4px 10px'
            }
          },
          [`● ${view.badge}`]
        )
      ]),
      View({ style: { ...rowMetaStyle, marginTop: '0', marginBottom: '14px', fontSize: '13px' } }, [
        view.hint
      ]),
      View({ style: { display: 'flex', flexDirection: 'row', marginBottom: '14px' } }, [
        View({ style: { ...statTileStyle, marginRight: '10px' } }, [
          View({ style: statValueStyle }, [String(watchFolders)]),
          View({ style: statLabelStyle }, ['Folders on watch'])
        ]),
        View({ style: statTileStyle }, [
          View({ style: statValueStyle }, [String(watchNotes)]),
          View({ style: statLabelStyle }, ['Notes on watch'])
        ])
      ]),
      Button({
        label: `⟳  ${view.button}`,
        style: primaryButtonStyle,
        onClick: () => this.requestSync()
      })
    ])
  },

  build(props) {
    this.loadState(props.settingsStorage)
    const syncStatus = readJson(props.settingsStorage, SYNC_STATUS_KEY, null)
    const { folders, notes } = this.state
    // Pinned notes first; otherwise newest first.
    const sortedNotes = [...notes].sort(
      (a, b) => Number(b.isPinned) - Number(a.isPinned) || (b.updatedAt || 0) - (a.updatedAt || 0)
    )

    return View({ style: pageStyle }, [
      View({ style: heroStyle }, [
        Image({
          src: LOGO_SRC,
          width: 52,
          height: 52,
          alt: 'Notelet',
          style: { borderRadius: '13px', marginRight: '14px' }
        }),
        View({ style: { flex: 1 } }, [
          View({ style: heroTitleStyle }, ['NoteLet']),
          View({ style: heroTaglineStyle }, [gettext('aboutBody')])
        ])
      ]),

      this.renderSyncCard(syncStatus),

      View({ style: cardStyle }, [
        this.renderHeader(gettext('foldersSectionTitle'), folders.length),
        folders.length > 0
          ? View(
              {},
              folders.map((folder, i) => this.renderFolderRow(folder, i === folders.length - 1))
            )
          : View({ style: emptyStateStyle }, [gettext('noFoldersYet')]),

        // The TextInput's own label is the tap target, styled as the add
        // button — tapping it opens the input modal straight away.
        TextInput({
          label: `+ ${gettext('addFolder')}`,
          placeholder: gettext('newFolderName'),
          value: '',
          labelStyle: addButtonStyle,
          onChange: (val) => this.addFolder(val)
        })
      ]),

      View({ style: cardStyle }, [
        this.renderHeader(gettext('notesSectionTitle'), notes.length),
        sortedNotes.length > 0
          ? View(
              {},
              sortedNotes.map((note, i) => this.renderNoteRow(note, i === sortedNotes.length - 1))
            )
          : View({ style: emptyStateStyle }, [gettext('noNotesYet')]),

        ...(folders.length > 0
          ? [
              View({ style: formLabelStyle }, [gettext('saveIn')]),
              View(
                { style: chipsStyle },
                [{ id: null, name: gettext('uncategorized') }, ...folders].map((folder) => {
                  const active = this.state.newNoteFolderId === folder.id
                  return Button({
                    // A style-only change on an otherwise-identical Button
                    // doesn't reliably re-render here — the label must
                    // differ too.
                    label: active ? `✓ ${folder.name}` : folder.name,
                    style: folderChipStyle(active),
                    onClick: () => this.selectNoteFolder(folder.id)
                  })
                })
              )
            ]
          : []),
        TextInput({
          label: `+ ${gettext('addNote')}`,
          placeholder: gettext('newNoteTitle'),
          value: '',
          labelStyle: addButtonStyle,
          onChange: (val) => this.addNote(val)
        })
      ])
    ])
  }
})
